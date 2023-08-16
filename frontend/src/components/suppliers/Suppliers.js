import React from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import Modal from "react-modal";
import ImportSuppliers from "./ImportDataSupplies";
import ExportSuppliers from "./ExportDataSuppliers";
const url = "https://inventory-5yt3.onrender.com/api";
const SupplierTable = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const searchTimeoutRef = useRef(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [payAndDeleteConfirmed, setPayAndDeleteConfirmed] = useState(false);
  const [supplierToDeleteId, setSupplierToDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (searchQuery === "") {
      // Fetch data without search query
      handlePagination(currentPage);
    } else {
      // Fetch data with search query
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
  const handlePagination = (page, search = "") => {
    fetch(`${url}/suppliers?page=${page}&search=${search}`)
      .then((response) => response.json())
      .then((data) => {
        setSuppliers(data.suppliers);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const handleEdit = (supplierId) => {
    navigate(`/suppliers/${supplierId}/edit`);
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
      // Only trigger the API call when there is a non-empty search query
      if (searchQuery.trim() !== "") {
        setSearchQuery(searchQuery.trim());
        handlePagination(1, searchQuery.trim());
      } else {
        // If the search query is empty, fetch data without search query
        setSearchQuery("");
        handlePagination(1);
      }
    }, 500);
  };
  const handleDeleteWithConfirmation = (supplierId) => {
    // Ask for confirmation before proceeding with the deletion
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );

    if (isConfirmed) {
      axios
        .delete(`${url}/suppliers/${supplierId}`)
        .then(() => {
          const updatedSuppliers = suppliers.filter(
            (supplier) => supplier._id !== supplierId
          );
          setSuppliers(updatedSuppliers);
          console.log("Supplier deleted successfully");
        })
        .catch((error) => {
          console.error("Error deleting supplier:", error);
        });
    }
  };

  const handlePayment = async (supplierId, amount) => {
    try {
      const supplier = suppliers.find(
        (supplier) => supplier._id === supplierId
      );
      if (!supplier) {
        console.error("Supplier not found");
        return;
      }
      // console.log(amount);

      const { email, phoneNumber } = supplier;

      const razorpay = new window.Razorpay({
        key: "rzp_test_v0t2cnfncCAg3M",
        amount: amount * 100,
        currency: "INR",
        name: "StockCentral",
        description: "Payment for Supplier",
        handler: async function () {
          const response = await axios.post(`${url}/payments`, {
            supplierId: supplierId,
            amount: amount,
            currency: "INR",
          });
          console.log(response);
          const order = response.data;
          console.log("order", order);
          console.log("Payment success:", response);
          const updatedSuppliers = suppliers.map((supplier) => {
            if (supplier._id === supplierId) {
              return {
                ...supplier,
                amount: 0,
                paymentStatus: "Payment Done",
              };
            }
            return supplier;
          });

          setSuppliers(updatedSuppliers);

          axios
            .put(`${url}/suppliers/${supplierId}/payment`, {
              amount: 0,
              paymentStatus: "Payment Done",
            })
            .then((response) => {
              console.log("Supplier updated successfully:", response.data);
            })
            .catch((error) => {
              console.error("Error updating supplier:", error);
            });
        },
        prefill: {
          email: email,
          contact: phoneNumber,
        },
      });

      razorpay.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  const handlePaymentAndDelete = async (supplierId, amount) => {
    try {
      const supplier = suppliers.find(
        (supplier) => supplier._id === supplierId
      );
      if (!supplier) {
        console.error("Supplier not found");
        return;
      }
      // console.log(amount);

      const { email, phoneNumber } = supplier;

      const razorpay = new window.Razorpay({
        key: "rzp_test_v0t2cnfncCAg3M",
        amount: amount * 100,
        currency: "INR",
        name: "StockCentral",
        description: "Payment for Supplier",
        handler: async function () {
          const response = await axios.post(`${url}/payments`, {
            supplierId: supplierId,
            amount: amount,
            currency: "INR",
          });
          console.log(response);
          const order = response.data;
          // If payment is successful, proceed with the deletion
          if (response.status === 200) {
            deleteSupplier(supplierId);
          }
          console.log("order", order);
          console.log("Payment success:", response);
          const updatedSuppliers = suppliers.map((supplier) => {
            if (supplier._id === supplierId) {
              return {
                ...supplier,
                amount: 0,
                paymentStatus: "Payment Done",
              };
            }
            return supplier;
          });

          setSuppliers(updatedSuppliers);

          axios
            .put(`${url}/suppliers/${supplierId}`, {
              amount: 0,
              paymentStatus: "Payment Done",
            })
            .then((response) => {
              console.log("Supplier updated successfully:", response.data);
            })
            .catch((error) => {
              console.error("Error updating supplier:", error);
            });
        },
        prefill: {
          email: email,
          contact: phoneNumber,
        },
      });

      razorpay.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
    }
  };

  const handleViewPayments = (supplierId) => {
    navigate(`/suppliers/${supplierId}/payments`);
  };

  const handleDelete = (supplierId) => {
    const supplier = suppliers.find((supplier) => supplier._id === supplierId);

    if (!supplier) {
      console.error("Supplier not found");
      return;
    }

    if (supplier.amount > 0) {
      // Show the custom modal for confirming Pay and Delete or Delete Directly
      setShowConfirmModal(true);
      setSupplierToDeleteId(supplierId);
    } else {
      handleDeleteWithConfirmation(supplierId);
    }
  };

  const handlePayAndDeleteConfirmed = () => {
    setShowConfirmModal(false);
    setPayAndDeleteConfirmed(true);
    handlePaymentAndDelete(
      supplierToDeleteId,
      suppliers.find((s) => s._id === supplierToDeleteId).amount
    );
  };

  const handleDeleteDirectlyConfirmed = () => {
    setShowConfirmModal(false);
    deleteSupplier(supplierToDeleteId);
  };

  const handleDeleteModalClose = () => {
    setShowConfirmModal(false);
    setPayAndDeleteConfirmed(false);
    setSupplierToDeleteId(null);
  };

  const deleteSupplier = (supplierId) => {
    axios
      .delete(`${url}/suppliers/${supplierId}`)
      .then(() => {
        const updatedSuppliers = suppliers.filter(
          (supplier) => supplier._id !== supplierId
        );
        setSuppliers(updatedSuppliers);
        console.log("Supplier deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting supplier:", error);
      });
  };

  const SupplierCard = ({
    supplier,
    id,
    handleEdit,
    handleDelete,
    handlePayment,
    handleViewPayments,
  }) => {
    return (
      <div className="p-4 border rounded shadow mb-4">
        <h3 className="text-lg font-semibold mb-2">{supplier.name}</h3>
        <p>
          <strong>Contact Name:</strong> {supplier.contactName}
        </p>
        <p>
          <strong>Phone Number:</strong> {supplier.phoneNumber}
        </p>
        <p>
          <strong>Amount Rupees:</strong> {supplier.amount}
        </p>
        <p>
          <strong>Email Address:</strong> {supplier.email}
        </p>
        <p>
          <strong>Address:</strong> {supplier.address}
        </p>
        <p>
          <strong>Supplier Id:</strong> {id}
        </p>
        <div className="mt-4 flex flex-wrap items-center space-x-3">
          {supplier.paymentStatus === "Payment Done" ? (
            <p className="text-green-500">Payment Done</p>
          ) : (
            <>
              <button
                className="mr-2 mb-2 bg-green-500 hover:bg-green-600 text-white py-1 px-2 rounded"
                onClick={() => handlePayment(supplier._id, supplier.amount)}
              >
                Pay Supplier
              </button>
              {supplier.paymentStatus === "success" && (
                <p className="text-green-500">Payment successful!</p>
              )}
              {supplier.paymentStatus === "error" && (
                <p className="text-red-500">Error processing payment.</p>
              )}
            </>
          )}
          <button
            className="mr-2 mb-2 bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
            onClick={() => handleEdit(supplier._id)}
          >
            Edit
          </button>
          <button
            className="mr-2 mb-2 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
            onClick={() => handleDelete(supplier._id)}
          >
            Delete
          </button>

          <Link
            to={`/suppliers/${supplier._id}/payments`}
            className="mr-2 mb-2 bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded"
            onClick={() => handleViewPayments(supplier._id)}
          >
            View Payments
          </Link>
        </div>
      </div>
    );
  };
  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-4xl text-gray-600">Loading...</div>
        </div>
      ) : (
        <>
          <div className="p-7">
            <ImportSuppliers />
            <ExportSuppliers />
          </div>
          <div className="search mt-8 mb-8 flex items-center p-7">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-7 lg:grid-cols-3">
            {suppliers.map((supplier) => (
              <SupplierCard
                key={supplier._id}
                id={supplier._id}
                supplier={supplier}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handlePayment={handlePayment}
                handleViewPayments={handleViewPayments}
              />
            ))}
          </div>

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
        </>
      )}

      <Modal
        isOpen={showConfirmModal}
        onRequestClose={handleDeleteModalClose}
        contentLabel="Confirm Delete Modal"
        className="modal"
        overlayClassName="modal-overlay"
        style={{
          overlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 1,
          },
          content: {
            position: "absolute",
            width: "500px",
            height: "300px",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            border: "none",
            background: "none",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: "4px",
            outline: "none",
            padding: "0",
          },
        }}
      >
        <div className="p-4 bg-white rounded shadow-md max-w-md">
          <h2 className="text-xl mb-4">Confirm Delete</h2>
          <p>The supplier has an outstanding amount. Do you want to:</p>
          <div className="mt-4 flex flex-wrap items-center space-x-3">
            <button
              className="mr-2 mb-2 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
              onClick={handlePayAndDeleteConfirmed}
            >
              Pay and Delete
            </button>
            <button
              className="mr-2 mb-2 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
              onClick={handleDeleteDirectlyConfirmed}
            >
              Delete Directly
            </button>
            <button
              className="mr-2 mb-2 bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded"
              onClick={handleDeleteModalClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default SupplierTable;
