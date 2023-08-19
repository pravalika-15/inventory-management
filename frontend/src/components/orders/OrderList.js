import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const url1 = "https://inventory-5yt3.onrender.com/api";
const OrderList = ({ role, userId, userData }) => {
  const [orders, setOrders] = useState([]);
  // const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [savingMessage, setSavingMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const searchTimeoutRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  // State to hold the input value
  // const [inputValue, setInputValue] = useState("");
  const debounceTimerRef = useRef(null);
  // State to hold the timer reference
  // const [timer, setTimer] = useState(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    handlePagination(currentPage, searchQuery, selectedDate);

    // Clean up the timeout on component unmount
    return () => {
      clearTimeout(debounceTimerRef.current, selectedDate);
    };
  }, [currentPage]);

  useEffect(() => {
    if (searchQuery === "") {
      // Fetch data without search query
      setCurrentPage(1);
      handlePagination(currentPage, selectedDate);
    } else {
      // Fetch data with search query
      setCurrentPage(1);
      handlePagination(currentPage, searchQuery, selectedDate);
    }

    // Clean up the timeout on component unmount
    return () => {
      clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    handlePagination(currentPage, searchQuery, selectedDate);
    return () => {
      clearTimeout(searchTimeoutRef.current);
    };
  }, [selectedDate]);

  const inputChanged = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear the previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a new timer to trigger the API call after debounce delay (e.g., 500ms)
    debounceTimerRef.current = setTimeout(() => {
      if (query) {
        // setLoading(true);
        handlePagination(1, query);
      } else {
        // setLoading(true);
        handlePagination(1);
      }
    }, 500);
  };

  const handlePagination = async (
    page,
    searchQuery = "",
    selectedDate = ""
  ) => {
    // console.log("role", role);
    // setLoading(true);
    setCurrentPage(page);

    try {
      let url = `${url1}/orders`;

      if (role === "user") {
        url = `${url1}/orders/user/${userId}`;
      }

      if (selectedDate) {
        console.log("selectedDate", selectedDate);
        const timezoneOffset = selectedDate.getTimezoneOffset();
        const adjustedDate = new Date(
          selectedDate.getTime() - timezoneOffset * 60000
        );
        console.log(adjustedDate);
        const isoFormattedDate = adjustedDate.toISOString().split("T")[0];
        console.log("isoFormattedDate:", isoFormattedDate);
        // const isoFormattedDate = new Date(selectedDate)
        //   .toISOString()
        //   .split("T")[0];
        console.log(isoFormattedDate);
        url += `?page=${page}&search=${searchQuery}&date=${isoFormattedDate}`;
      } else {
        url += `?page=${page}&search=${searchQuery}`;
      }
      console.log("url", url);
      fetch(url)
        .then((response) => response.json())
        .then(async (data) => {
          const ordersData = data.orders;
          console.log(data);
          console.log(data.orders);
          console.log("ordersData", ordersData);
          const ordersWithProductNames = await Promise.all(
            ordersData.map(async (order) => {
              const itemsWithProductNames = await Promise.all(
                order.items.map(async (item) => {
                  const productName = await fetchProductName(item.product);
                  console.log("sdfg", { ...item, productName });
                  return { ...item, productName };
                })
              );
              console.log("itemsWithProductNames", itemsWithProductNames);
              // console.log("itemsWithProductNames", {
              //   ...order,
              //   items: itemsWithProductNames,
              // });
              return { ...order, items: itemsWithProductNames };
            })
          );

          setOrders(ordersWithProductNames);
          console.log("ordersWithProductNames", ordersWithProductNames);
          setCurrentPage(data.currentPage);
          setTotalPages(data.totalPages);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    } catch (error) {
      console.error("Error fetching orders:", error);
      setLoading(false);
    }
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

    // Set a new timeout to trigger the API call after debounce delay (e.g., 500ms)
    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim() !== "" || selectedDate) {
        setSearchQuery(searchQuery.trim());
        // handlePagination(1, searchQuery.trim(), selectedDate);
      } else {
        // If the search query is empty, fetch data without search query
        setSearchQuery("");
        // handlePagination(1, "", selectedDate);
      }
    }, 500);
  };
  const fetchProductName = async (productId) => {
    try {
      console.log(productId);
      const response = await axios.get(`${url1}/products/${productId}`);
      // console.log(response.data.name);
      return response.data.name;
    } catch (error) {
      console.error("Error fetching product name:", error);
      return "";
    }
  };

  const handleDelete = (orderId) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete the order ${orderId}?`
    );

    if (isConfirmed) {
      axios
        .delete(`${url1}/orders/${orderId}`)
        .then(() => {
          const updatedOrders = orders.filter((order) => order._id !== orderId);
          setOrders(updatedOrders);
          console.log("Order deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting order:", error);
        });
    }
  };

  const handleChangeStatus = (orderId) => {
    setSelectedOrderId(orderId);
    setSelectedStatus("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalLoading(false);
    setShowModal(false);
  };

  const handleStatusChange = () => {
    if (selectedStatus) {
      setModalLoading(true); // Set loading to true when the user clicks "Save"
      setSavingMessage("Saving update...");
      axios
        .put(`${url1}/orders/${selectedOrderId}/status`, {
          status: selectedStatus,
        })
        .then((response) => {
          const updatedOrders = orders.map((order) => {
            if (order._id === selectedOrderId) {
              return { ...order, status: response.data.status };
            }
            return order;
          });
          setOrders(updatedOrders);
          console.log("Order status updated successfully");
          closeModal();
        })
        .catch((error) => {
          console.error("Error updating order status:", error);
        });
    }
  };

  const handleViewPaymentDetails = async (orderId) => {
    try {
      const response = await axios.get(`${url1}/order-payments/${orderId}`);
      setSelectedPaymentDetails(response.data);
      setShowPaymentCard(true);
      setSelectedOrderId(orderId);
    } catch (error) {
      console.error("Error fetching payment details:", error);
    }
  };

  const handleClosePaymentCard = () => {
    setShowPaymentCard(false);
  };
  const handleCancelOrder = (orderId) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to cancel the order with ID ${orderId}?`
    );

    if (isConfirmed) {
      axios
        .put(`${url1}/orders/${orderId}/status`, {
          status: "Waiting for cancellation confirmation",
        })
        .then((response) => {
          const updatedOrders = orders.map((order) => {
            if (order._id === orderId) {
              return { ...order, status: response.data.status };
            }
            return order;
          });
          setOrders(updatedOrders);
          // console.log(orders);
          setKey((prevKey) => prevKey + 1);
          console.log("Order status updated successfully");
        })
        .catch((error) => {
          console.error("Error updating order status:", error);
        });
    }
  };

  const name = userData ? userData.username : "";

  const handleInitiateRefund = async (orderId) => {
    try {
      // Make a GET request to fetch the order details using the orderId
      const response = await axios.get(`${url1}/orders/${orderId}`);
      const order = response.data;

      // Calculate the refund amount based on the order total price
      const amount = order.totalPrice * 100; // Converting to paisa (assuming totalPrice is in rupees)

      // Replace the following placeholders with your actual Razorpay API keys
      const razorpayKeyId = "rzp_test_v0t2cnfncCAg3M";
      // const razorpayOrderId = "your_razorpay_order_id";
      const currency = "INR"; // Replace with the actual currency

      // If the refund entry is successfully created, open the Razorpay payment window for the refund
      const options = {
        key: razorpayKeyId,
        amount: amount.toString(),
        currency,
        name: "StockCentral",
        description: "Refund for Order #" + orderId,
        // order_id: refundResponse.data.id,
        handler: async function (response) {
          try {
            const updatedOrders = orders.map((order) => {
              if (order._id === orderId) {
                return { ...order, status: "Refund initiated" };
              }
              return order;
            });
            setOrders(updatedOrders);
            console.log("Refund successful!", response);
            // Make a POST request to your backend to create a new refund entry in /order-payments
            const refundResponse = await axios.post(`${url1}/order-payments`, {
              orderId,
              paymentId: orderId,
              amount,
              currency,
              status: "Refund initiated",
            });
            console.log(refundResponse.data);

            // Update the order status to "refund initiated" in the backend
            const updateResponse = await axios.put(
              `${url1}/orders/${orderId}/status`,
              { status: "Refund initiated" }
            );
            if (updateResponse.data.status === "Refund initiated") {
              // Show a message or take any other action to indicate that refund was initiated
              console.log("Refund initiated for Order #" + orderId);
            } else {
              console.error("Failed to update order status on the server");
            }
          } catch (error) {
            console.error("Error updating order status:", error);
          }
        },
        prefill: {
          name: userData.username, // User's name
          email: userData.email, // User's email
          contact: "user_contact_number", // User's contact number
        },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error initiating refund:", error);
    }
  };

  const formatDate = (dateTimeString) => {
    const dateObj = new Date(dateTimeString);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const seconds = String(dateObj.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };
  return (
    <>
      <div key={key}>
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <div className="text-4xl text-gray-600">Loading...</div>
          </div>
        ) : (
          // ) : orders.length === 0 ? (
          //   <div className="flex items-center justify-center h-screen">
          //     <p className="text-2xl text-gray-600">
          //       {role === "user"
          //         ? `No orders found for ${name}`
          //         : "No orders found"}
          //     </p>
          //   </div>
          // ) :
          <>
            <div className="search mt-8 mb-8 flex items-center px-5">
              <input
                type="text"
                id="search-input"
                placeholder="Search products"
                value={searchQuery}
                onChange={inputChanged}
                className="border border-gray-300 rounded py-2 px-4 w-1/2 mr-4"
              />
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd" // Format the date as "yyyy-MM-dd"
                isClearable // Add an option to clear the selected date
                placeholderText="Select Date" // Placeholder text for the date picker
                className="border border-gray-300 rounded py-2 px-4 w-full"
              />
              {/* <button
                id="search-button"
                onClick={handleSearch}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Search
              </button> */}
            </div>
            <div className="px-5">
              {role === "user" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 px-3 py-5 text-center">
                    Orders List for {name}
                  </h2>
                </div>
              )}
              {role === "admin" && (
                <div>
                  <h2 className="text-2xl font-bold mb-4  px-3 py-5 text-center ">
                    Orders List
                  </h2>
                </div>
              )}

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-white rounded-lg p-6 shadow-md flex flex-col justify-between"
                  >
                    <div>
                      <p className="text-xl font-semibold mb-4">
                        Order ID: {order.orderID}
                      </p>
                      <p className="mb-2">
                        <span className="font-semibold">Customer:</span>{" "}
                        {order.userID}
                      </p>
                      <div className="mb-4">
                        <span className="font-semibold">
                          Product and quantity:
                        </span>
                        {order.items.map((item) => (
                          <div key={item._id} className="mb-2">
                            <p>{item.productName}</p>
                            <p>Quantity: {item.quantity}</p>
                          </div>
                        ))}
                      </div>
                      <p className="mb-4">
                        <span className="font-semibold">Status:</span>{" "}
                        {order.status}
                      </p>
                      <p className="mb-4">
                        <span className="font-semibold">Ordered on:</span>{" "}
                        {formatDate(order.orderDate)}
                      </p>
                    </div>

                    {/* Buttons as the footer */}
                    {/* Buttons as the footer */}
                    <div className="flex flex-wrap justify-center gap-2 md:justify-end md:gap-4">
                      {role === "admin" && (
                        <>
                          {order.status ===
                            "Waiting for cancellation confirmation" && (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                              onClick={() => handleInitiateRefund(order._id)}
                            >
                              Initiate Refund
                            </button>
                          )}
                          {order.status === "Refund initiated" && (
                            <p>Order Cancelled!</p>
                          )}
                          {["delivered", "Refund initiated"].includes(
                            order.status
                          ) && (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                              onClick={() => handleDelete(order._id)}
                            >
                              Delete
                            </button>
                          )}
                          {order.status !== "delivered" &&
                            order.status !== "Refund initiated" &&
                            order.status !==
                              "Waiting for cancellation confirmation" && (
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                                onClick={() => handleInitiateRefund(order._id)}
                              >
                                Cancel Order
                              </button>
                            )}
                          {[
                            "order placed",
                            "packed",
                            "dispatched",
                            "shipped",
                            "in transit",
                          ].includes(order.status) && (
                            <button
                              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded"
                              onClick={() => handleChangeStatus(order._id)}
                            >
                              Change Status
                            </button>
                          )}
                        </>
                      )}

                      {role === "user" && (
                        <>
                          {["order placed", "packed", "dispatched"].includes(
                            order.status
                          ) && (
                            <button
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              Cancel
                            </button>
                          )}
                          {order.status ===
                            "Waiting for cancellation confirmation" && (
                            <p>Waiting for cancellation confirmation</p>
                          )}
                        </>
                      )}

                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
                        onClick={() => handleViewPaymentDetails(order._id)}
                      >
                        View Payment Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 mx-auto w-96">
                    <h2 className="text-2xl font-bold mb-4">
                      Change Order Status
                    </h2>
                    {modalLoading ? (
                      // Show the saving message when modalLoading is true
                      <p className="mt-2 text-center text-gray-600 font-bold">
                        {savingMessage}
                      </p>
                    ) : (
                      // Show the normal modal content when modalLoading is false
                      <>
                        <select
                          className="border border-gray-300 rounded px-4 py-2 w-full mb-4"
                          value={selectedStatus}
                          onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                          <option value="">Select Status</option>
                          <option value="order placed">Order Placed</option>
                          <option value="packed">Packed</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="shipped">Shipped</option>
                          <option value="in transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                        </select>
                        <div className="flex justify-end">
                          <button
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mr-2"
                            onClick={handleStatusChange}
                          >
                            Save
                          </button>
                          <button
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
                            onClick={closeModal}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              {showPaymentCard && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-4 mx-auto w-full sm:w-96 shadow-lg">
                    <div className="flex justify-between mb-4">
                      <h2 className="text-2xl font-bold text-blue-600">
                        Payment Details for Order {selectedOrderId}
                      </h2>
                      {/* <button
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                        onClick={handleClosePaymentCard}
                      >
                        Close
                      </button> */}
                    </div>
                    <div className="h-60 overflow-y-auto space-y-4">
                      {selectedPaymentDetails.map((payment) => (
                        <div
                          key={payment._id}
                          className="bg-blue-50 rounded p-4"
                        >
                          <p className="text-blue-600 font-semibold">
                            Order ID: {payment.orderId}
                          </p>
                          <p>Payment ID: {payment.paymentId}</p>
                          <p>Amount: {payment.amount}</p>
                          <p>Currency: {payment.currency}</p>
                          <p>Status: {payment.status}</p>
                          <p>
                            Payment Date:{" "}
                            {new Date(payment.paymentDate).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
                        onClick={handleClosePaymentCard}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {orders.length !== 0 && (
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
            )}

            {orders.length === 0 && (
              <div className="container p-5">No orders Listed!</div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default OrderList;
