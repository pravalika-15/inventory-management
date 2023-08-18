import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import ImportData from "./ImportData";
import ExportData from "./ExportData";
const url = "https://inventory-5yt3.onrender.com/api";
const ProductListing = ({ role, userId }) => {
  // console.log("userId", userId);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchQuery === "") {
      // Fetch data without search query
      setCurrentPage(1);
      handlePagination(currentPage);
    } else {
      // Fetch data with search query
      setCurrentPage(1);
      handlePagination(currentPage, searchQuery);
    }

    // Clean up the timeout on component unmount
    return () => {
      clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery === "") {
      // Fetch data without search query
      handlePagination(currentPage);
    } else {
      handlePagination(currentPage, searchQuery);
    }

    // Clean up the timeout on component unmount
    return () => {
      clearTimeout(searchTimeoutRef.current);
    };
  }, [currentPage]);
  // Function to fetch the cart data from the server
  const fetchCartData = async () => {
    try {
      if (userId) {
        const response = await axios.get(`${url}/cart/${userId}`);
        setCart(response.data[0].items);
        console.log(response.data[0].items);
        // console.log(response.data.items);
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
    }
  };

  // Fetch the cart data when the component mounts (page loads)
  useEffect(() => {
    fetchCartData();
  }, [userId]);
  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      fetch(`${url}/products/${productId}`, {
        method: "DELETE",
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Product deleted successfully") {
            const updatedProducts = products.filter(
              (product) => product._id !== productId
            );
            setProducts(updatedProducts);
          } else {
            console.error("Failed to delete product");
          }
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
        });
    }
  };

  const handlePagination = (page, search = "") => {
    fetch(`${url}/products?page=${page}&search=${search}`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handleSearch = () => {
    setLoading(true);

    // Clear the previous timeout to prevent multiple API calls
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        setSearchQuery(searchQuery.trim());
        setCurrentPage(1);
      } else {
        setCurrentPage(1);
        setSearchQuery("");
      }
    }, 500);
  };

  const handleAddToCart = async (product) => {
    if (userId === "") {
      navigate("/login", { state: { from: window.location.pathname } });
    } else {
      const existingCartItem = cart.find(
        (item) => item.productId === product._id
      );
      console.log("product._id", product._id);
      if (existingCartItem) {
        // Product already exists in the cart, increase the quantity by 1
        const updatedCart = cart.map((item) => {
          if (item.productId === product._id) {
            return { ...item, quantity: item.quantity + 1 };
          }
          return item;
        });

        setCart(updatedCart);

        // Update the cart item on the server
        try {
          await axios.put(`${url}/cart/items/${existingCartItem._id}`, {
            quantity: existingCartItem.quantity + 1,
          });
          // Update the local cart state
          setCart(updatedCart);
        } catch (error) {
          console.error("Error updating cart item quantity:", error);
        }
      } else {
        // Product doesn't exist in the cart, add it to the cart and save to the server
        try {
          const response = await axios.post(`${url}/cart`, {
            productId: product._id,
            quantity: 1,
            userId: userId,
          });
          console.log(response);
          const savedCartItem = response.data;
          setCart((prevCart) => [...prevCart, savedCartItem]);
          console.log("cart", cart);
          console.log("added");
          // Fetch the updated cart data from the server
          fetchCartData();
          // Show the alert message when a product is added to the cart
          setAlertMessage(`${product.name} added to cart successfully!!`);
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
          }, 3000);
        } catch (error) {
          console.error("Error adding item to cart:", error);
        }
      }
    }
  };

  const handleIncrementQuantity = async (cartItemId) => {
    try {
      // Find the cart item by its ID
      const cartItem = cart.find((item) => item._id === cartItemId);

      if (!cartItem) {
        return;
      }

      const newQuantity = cartItem.quantity + 1;

      // Update the cart item quantity locally
      const updatedCart = cart.map((item) =>
        item._id === cartItemId ? { ...item, quantity: newQuantity } : item
      );

      if (newQuantity > 0) {
        setCart(updatedCart);

        // Send the updated quantity to the server
        await axios.put(`${url}/cart/items/${cartItemId}`, {
          quantity: newQuantity,
        });
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };

  const handleDecrementQuantity = async (cartItemId) => {
    try {
      // Find the cart item by its ID
      const cartItem = cart.find((item) => item._id === cartItemId);

      if (!cartItem) {
        return;
      }

      let newQuantity = cartItem.quantity - 1;

      if (newQuantity <= 0) {
        // If the new quantity is zero or less, remove the item from the cart
        newQuantity = 0;
        const updatedCart = cart.filter((item) => item._id !== cartItemId);
        setCart(updatedCart);

        // // Send the updated quantity to the server to remove the item
        // await axios.put(`${url}/cart/items/${cartItemId}`, {
        //   quantity: newQuantity,
        // });

        // Remove the cart item from the server
        await axios.delete(`${url}/cart/${userId}/${cartItemId}`);
      } else {
        // Update the cart item quantity locally
        const updatedCart = cart.map((item) =>
          item._id === cartItemId ? { ...item, quantity: newQuantity } : item
        );
        setCart(updatedCart);

        // Send the updated quantity to the server
        await axios.put(`${url}/cart/items/${cartItemId}`, {
          quantity: newQuantity,
        });
      }
    } catch (error) {
      console.error("Error updating cart item quantity:", error);
    }
  };

  return (
    <>
      <div className="container mx-auto py-4 px-5">
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-4xl text-gray-600">Loading...</div>
          </div>
        ) : (
          <>
            {role === "admin" && (
              <>
                <ImportData />
                <ExportData />
              </>
            )}

            <div className="search mt-8 mb-8 flex items-center">
              <input
                type="text"
                id="search-input"
                placeholder="Search products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded py-2 px-4 w-1/2 mr-4"
              />
              {/* <button
                id="search-button"
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Search
              </button> */}
            </div>
            <main>
              <h1 className="text-3xl font-bold mb-8">Product Listing</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product) => (
                  <div
                    key={product._id}
                    className="bg-white rounded shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <h2 className="text-xl font-semibold mb-4">
                      {product.name}
                    </h2>
                    <p className="text-gray-600 mb-2">
                      Category: {product.category}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Price: ₹{product.price.toFixed(2)}
                    </p>
                    <p className="text-gray-600 mb-2">
                      Quantity: {product.quantity}
                    </p>
                    <p className="text-gray-600 mb-4">{product.description}</p>
                    <p className="text-gray-700">
                      Supplier: {product.supplier.name}
                    </p>
                    <p className="text-gray-700">
                      Contact: {product.supplier.phoneNumber}
                    </p>
                    {role === "user" && (
                      <>
                        {product.quantity === 0 ? (
                          <div className="mt-4">
                            <p className="text-red-500 font-semibold">
                              Out of Stock
                            </p>
                          </div>
                        ) : (
                          <div className="mt-4 flex">
                            {/* {console.log(
                              cart.some(
                                (item) => item.productId._id === product._id
                              )
                            )} */}
                            {cart.some(
                              (item) => item.productId._id === product._id
                            ) ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleDecrementQuantity(
                                      cart.find(
                                        (item) =>
                                          item.productId._id === product._id
                                      )._id
                                    )
                                  }
                                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded mr-2"
                                >
                                  -
                                </button>
                                <span className="font-semibold mx-2">
                                  {
                                    cart.find(
                                      (item) =>
                                        item.productId._id === product._id
                                    ).quantity
                                  }
                                </span>
                                <button
                                  onClick={() =>
                                    handleIncrementQuantity(
                                      cart.find(
                                        (item) =>
                                          item.productId._id === product._id
                                      )._id
                                    )
                                  }
                                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded ml-2"
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleAddToCart(product)}
                                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                              >
                                Add to Cart
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    {role === "admin" && (
                      <>
                        <div className="mt-4">
                          {product.quantity === 0 && (
                            <div className="">
                              <p className="text-red-500 font-semibold">
                                Out of Stock
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="mt-4">
                          <Link
                            to={`/products/${product._id}/edit`}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </main>
            <div className="pagination flex items-center justify-center mt-8">
              <button
                id="prevPageBtn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mr-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span id="currentPage" className="text-gray-600 font-bold mx-2">
                {currentPage}
              </span>
              <span id="totalPages" className="text-gray-500">
                of {totalPages}
              </span>
              <button
                id="nextPageBtn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded ml-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            {/* Show the alert message */}
            {showAlert && (
              <div
                className="fixed top-0 left-25 m-4 bg-gray-300 z-50 text-black p-4 rounded"
                style={{ left: "50%", transform: "translateX(-50%)" }}
              >
                {alertMessage}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default ProductListing;
