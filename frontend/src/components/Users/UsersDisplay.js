import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../../assets/css/customModal.css";
import OrderAnalyticsModal from "../Chart/OrderAnalyticsModal";
const url = "https://inventory-5yt3.onrender.com/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    email: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeoutRef = useRef(null);
  // const [error, setError]
  const [isOrderAnalyticsModalOpen, setIsOrderAnalyticsModalOpen] =
    useState(false);
  const [selectedUserForAnalytics, setSelectedUserForAnalytics] =
    useState(null);
  const handleViewAnalytics = (user) => {
    // console.log("user", user);
    setSelectedUserForAnalytics(user);
    setIsOrderAnalyticsModalOpen(true);
  };
  useEffect(() => {
    if (searchQuery === "") {
      // Fetch data without search query
      // setCurrentPage(1);
      handlePagination(currentPage);
    } else {
      // Fetch data with search query
      // setCurrentPage(1);
      handlePagination(currentPage, searchQuery);
    }

    // Clean up the timeout on component unmount
    return () => {
      clearTimeout(searchTimeoutRef.current);
    };
  }, [currentPage]);

  useEffect(() => {
    if (searchQuery === "") {
      // Fetch data without search query
      setCurrentPage(1);
      handlePagination(1);
    } else {
      // Fetch data with search query
      setCurrentPage(1);
      handlePagination(1, searchQuery);
    }

    // Clean up the timeout on component unmount
    return () => {
      clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handlePagination = (page, search = "") => {
    fetch(`${url}/users?page=${page}&search=${search}`)
      .then((response) => response.json())
      .then((data) => {
        // console.log(data);
        setUsers(data.users);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleUpdate = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      phone: user.phone,
      email: user.email,
    });
    setErrorMessage("");
    setIsModalOpen(true);
  };
  const handleSearch = () => {
    setLoading(true);
    setCurrentPage(1);
    // Clear the previous timeout to prevent multiple API calls
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set a new timeout to trigger the API call after debounce delay (e.g., 500ms)
    searchTimeoutRef.current = setTimeout(() => {
      // Only trigger the API call when there is a non-empty search query
      if (searchQuery.trim() !== "") {
        setSearchQuery(searchQuery.trim());
        setCurrentPage(1);
        handlePagination(1, searchQuery.trim());
      } else {
        // If the search query is empty, fetch data without search query
        setSearchQuery("");
        setCurrentPage(1);
        handlePagination(1);
      }
    }, 500);
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
  const handleDelete = async (userId) => {
    // Ask for confirmation using window.confirm()
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!isConfirmed) {
      // If the user cancels the deletion, do nothing
      return;
    }

    try {
      await axios.delete(`${url}/users/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      alert("User deleted successfully");
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      const response = await axios.put(
        `${url}/users/${selectedUser._id}`,
        formData
      );

      const updatedUser = response.data;
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        )
      );

      setSelectedUser(null);
      setFormData({ username: "", phone: "", email: "" });
      setErrorMessage("");
      setIsModalOpen(false);
      alert("User updated successfully:", updatedUser);
      console.log("User updated successfully:", updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Failed to update user");
      }
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
          <div className="search mt-8 mb-8 flex items-center p-5">
            <input
              type="text"
              id="search-input"
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 rounded py-2 px-4 w-1/2 mr-4"
            />
            <button
              id="search-button"
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Search
            </button>
          </div>
          <div className="container mx-auto py-8 px-5">
            <h2 className="text-2xl font-bold mb-4">Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user._id} className="bg-white rounded shadow-md p-4">
                  <h3 className="text-lg font-semibold mb-2">
                    {user.username}
                  </h3>
                  <p className="text-gray-600 mb-2">Phone: {user.phone}</p>
                  <p className="text-gray-600 mb-2">Email: {user.email}</p>
                  <div className="flex justify-end mt-2 gap-2">
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
                      onClick={() => handleViewAnalytics(user)} // Add this
                    >
                      View Order Analytics
                    </button>
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
                      onClick={() => handleUpdate(user)}
                    >
                      Update
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
                      onClick={() => handleDelete(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination flex items-center justify-center mt-8 px-5">
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

            {selectedUser && (
              <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50">
                <div className="bg-white rounded-lg p-4 mx-4 md:mx-auto shadow-lg custom-modal">
                  <h3 className="text-xl font-bold mb-2">Update User</h3>
                  {errorMessage && (
                    <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
                  )}
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 font-bold mb-2"
                        htmlFor="username"
                      >
                        Username
                      </label>
                      <input
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="username"
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 font-bold mb-2"
                        htmlFor="phone"
                      >
                        Phone
                      </label>
                      <input
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="phone"
                        type="text"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="block text-gray-700 font-bold mb-2"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <input
                        className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit"
                      >
                        Save Changes
                      </button>
                      <button
                        className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        onClick={() => setSelectedUser(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {isOrderAnalyticsModalOpen && selectedUserForAnalytics !== null && (
        <OrderAnalyticsModal
          userId={selectedUserForAnalytics._id}
          onClose={() => setIsOrderAnalyticsModalOpen(false)}
        />
      )}
    </>
  );
};

export default Users;
