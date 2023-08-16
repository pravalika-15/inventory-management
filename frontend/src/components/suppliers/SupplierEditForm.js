import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
const url = "https://inventory-5yt3.onrender.com/api";
const SupplierEditForm = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const validateForm = () => {
    const errors = {};

    if (name.trim() === "") {
      errors.name = "Name is required";
    }

    if (contactName.trim() === "") {
      errors.contactName = "Contact Name is required";
    }

    if (phoneNumber.trim() === "") {
      errors.phoneNumber = "Phone Number is required";
    }
    if (amount === "") {
      errors.amount = "amount is required";
    }

    if (email.trim() === "") {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email address";
    }

    if (address.trim() === "") {
      errors.address = "Address is required";
    }

    return errors;
  };
  useEffect(() => {
    // Fetch the existing supplier data from the backend API
    axios
      .get(`${url}/suppliers/${id}`)
      .then((response) => {
        setSupplier(response.data);
        setName(response.data.name);
        setContactName(response.data.contactName);
        setPhoneNumber(response.data.phoneNumber);
        setEmail(response.data.email);
        setAddress(response.data.address);
        setAmount(response.data.amount);
      })
      .catch((error) => {
        console.error("Error fetching supplier:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          // Set the server error message from the response data
          setServerError(error.response.data.error);
        } else {
          // If there's no specific error message from the server, display a generic message
          setServerError("Failed to create the supplier");
        }
      });
  }, [id]);

  const handleSubmit = (event) => {
    event.preventDefault();
    // Validate the form fields using the validateForm function
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      // If there are errors, set the errors state and stop form submission
      setErrors(formErrors);
      return;
    }
    // Update the supplier using the modified data
    const updatedSupplier = {
      ...supplier,
      name,
      contactName,
      phoneNumber,
      email,
      address,
      amount,
    };

    // Send the updated supplier data to the backend API
    axios
      .put(`${url}/suppliers/${id}`, updatedSupplier)
      .then((response) => {
        console.log("Supplier updated:", response.data);
        navigate("/suppliers");
      })
      .catch((error) => {
        console.error("Error updating supplier:", error.response.data);
        setErrors(error.response.data);
        console.log(error.response.data, error);
        setServerError(error.response.data.error);
      });
  };

  const handleCancel = () => {
    // Navigate back to the suppliers page
    navigate("/suppliers");
  };

  const handleInputChange = (event, field) => {
    const { value } = event.target;

    // Clear the error for the corresponding field
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));

    // Update the field value
    switch (field) {
      case "name":
        setName(value);
        break;
      case "contactName":
        setContactName(value);
        break;
      case "phoneNumber":
        setPhoneNumber(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "address":
        setAddress(value);
        break;
      case "amount":
        setAmount(value);
        break;
      default:
        break;
    }
  };

  if (!supplier) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">
        Edit Supplier: {supplier.name}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="font-semibold">
            Supplier Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(event) => handleInputChange(event, "name")}
            className="border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:border-blue-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm italic">{errors.name}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="contactName" className="font-semibold">
            Contact Name:
          </label>
          <input
            type="text"
            id="contactName"
            value={contactName}
            onChange={(event) => handleInputChange(event, "contactName")}
            className="border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:border-blue-500"
          />
          {errors.contactName && (
            <p className="text-red-500 text-sm italic">{errors.contactName}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="phoneNumber" className="font-semibold">
            Phone Number:
          </label>
          <input
            type="text"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(event) => handleInputChange(event, "phoneNumber")}
            className="border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:border-blue-500"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm italic">{errors.phoneNumber}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="amount" className="font-semibold">
            Amount Rupees:
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(event) => handleInputChange(event, "amount")}
            className="border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:border-blue-500"
          />
          {errors.amount && (
            <p className="text-red-500 text-xs italic">{errors.amount}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="font-semibold">
            Email Address:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(event) => handleInputChange(event, "email")}
            className="border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:border-blue-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs italic">{errors.email}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label htmlFor="address" className="font-semibold">
            Address:
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(event) => handleInputChange(event, "address")}
            className="border border-gray-300 px-3 py-2 rounded mt-1 focus:outline-none focus:ring focus:border-blue-500"
          />
          {errors.address && (
            <p className="text-red-500 text-xs italic">{errors.address}</p>
          )}
        </div>
        {serverError && (
          <p className="text-red-500 text-xs italic">{serverError}</p>
        )}

        <div className="flex space-x-4">
          {/* Update Supplier Button */}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Update Supplier
          </button>

          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierEditForm;
