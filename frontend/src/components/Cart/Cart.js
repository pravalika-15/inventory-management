import React, { useEffect, useState } from "react";
import axios from "axios";
const url = "https://inventory-5yt3.onrender.com/api";
const Cart = ({ userId }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    console.log("Component mounted");
    return () => {
      console.log("Component will unmount");
    };
  }, []);
  useEffect(() => {
    setLoading(true);
    fetchCart();
  }, [userId]); // Add cartItems as a dependency
  console.log("userId", userId);
  const fetchCart = async () => {
    console.log("userId", userId);
    try {
      const response = await axios.get(`${url}/cart/${userId}`);
      console.log(response);
      const cartItems = response.data[0].items;
      console.log(cartItems);

      // Iterate over the cart items and fetch the product data for each item
      const updatedCartItems = await Promise.all(
        cartItems.map(async (item) => {
          console.log("item", item);
          const productId = item.productId._id;

          // Fetch the product data using the product ID
          const productResponse = await axios.get(
            `${url}/products/${productId}`
          );
          const productData = productResponse.data;

          // Add the product data to the item object
          const updatedItem = {
            ...item,
            product: productData,
          };

          return updatedItem;
        })
      );

      setCartItems(updatedCartItems);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching cart:", error);
    }
  };

  const clearCartOnServer = async () => {
    try {
      await axios.delete(`${url}/cart/clear/${userId}`);
      console.log("Cart cleared on the server");
    } catch (error) {
      console.error("Error clearing cart on the server:", error);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      if (newQuantity > 0) {
        await axios.put(`${url}/cart/items/${itemId}`, {
          quantity: newQuantity,
        });
        console.log("Cart item quantity updated");

        // Update the quantity in the cartItems state
        const updatedCartItems = cartItems.map((item) => {
          if (item._id === itemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });
        setCartItems(updatedCartItems);
      } else {
        // If the new quantity is 0 or negative, remove the item from the cart
        handleRemoveItem(itemId);
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const response = await axios.delete(`${url}/cart/${userId}/${itemId}`);
      console.log("Cart item removed");
      console.log(response);

      // Remove the item from the cartItems state
      const updatedCartItems = cartItems.filter((item) => item._id !== itemId);
      setCartItems(updatedCartItems);
    } catch (error) {
      console.error("Error removing cart item:", error);
    }
  };

  useEffect(() => {
    // Calculate the total price when cartItems change
    const totalPrice = cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    setTotalPrice(totalPrice);
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    try {
      const roundedTotalPrice = Math.round(totalPrice * 100);
      console.log({
        userID: userId,
        items: cartItems.map((item) => ({
          productId: item.productId._id,
          quantity: item.quantity,
        })),
        totalPrice: totalPrice,
      });

      // Initialize Razorpay
      const razorpayOptions = {
        key: "rzp_test_v0t2cnfncCAg3M",
        amount: roundedTotalPrice, // Amount in paise or the smallest currency unit
        currency: "INR",
        name: "StockCentral",
        description: "Payment for Order",
        prefill: {
          email: "customer@example.com",
          contact: "9876543210",
        },
        handler: async function (response) {
          console.log("Payment success:", response);
          if (response.razorpay_payment_id) {
            try {
              // Proceed with saving payment details and clearing the cart
              const paymentDetails = {
                orderId: "", // We will update this after creating the order
                paymentId: response.razorpay_payment_id,
                amount: roundedTotalPrice / 100, // Convert back to rupees from paise
                currency: "INR",
                status: "paid", // You can adjust the status based on the response
              };

              // Create an order on the server
              const orderResponse = await axios.post(`${url}/orders`, {
                userID: userId,
                items: cartItems.map((item) => ({
                  productId: item.productId._id,
                  quantity: item.quantity,
                })),
                totalPrice: totalPrice,
              });

              const order = orderResponse.data;
              console.log("order");
              console.log(order);

              // Update the orderId in paymentDetails
              paymentDetails.orderId = order._id;

              // Save payment details to the server
              const orderPaymentResponse = await axios.post(
                `${url}/order-payments`,
                paymentDetails
              );
              console.log(orderPaymentResponse);

              // Clear the cart by setting cartItems to an empty array
              setCartItems([]);
              // Clear the cart on the server-side
              clearCartOnServer();
              // You can perform any additional actions after successful payment here
            } catch (error) {
              console.error("Error saving payment details:", error);
            }
          } else {
            // Payment was not completed or user closed the modal without completing the payment
            console.log("Payment not completed or cancelled.");
            // You can handle this scenario as needed, for example, show an error message or prompt the user to retry the payment.
          }
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-4xl text-gray-600">Loading...</div>
        </div>
      ) : (
        <>
          <div className="container mx-auto py-8">
            <h2 className="text-3xl font-bold mb-4">Cart</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              <div className="mr-5 ml-3">
                <ul className="divide-y divide-gray-300">
                  {cartItems.map((item) => (
                    <li key={item._id} className="py-4 flex items-center">
                      <div className="flex-grow">
                        <h3 className="text-xl font-semibold">
                          {item.product.name}
                        </h3>
                        <p className="text-gray-600">
                          Price: ₹{item.product.price}
                        </p>
                        <div className="flex items-center mt-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-l"
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity - 1)
                            }
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="border border-gray-300 rounded py-1 px-2 mx-1 text-center"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(
                                item._id,
                                parseInt(e.target.value)
                              )
                            }
                          />
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-r"
                            onClick={() =>
                              handleQuantityChange(item._id, item.quantity + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        className="ml-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                        onClick={() => handleRemoveItem(item._id)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold">
                    Total Price: ₹{totalPrice.toFixed(2)}
                  </h3>
                  <button
                    className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
                    onClick={() => handlePlaceOrder(totalPrice.toFixed(2))}
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
