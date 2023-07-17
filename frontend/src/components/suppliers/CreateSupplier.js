import React, { useState } from "react";
import axios from "axios";
import "../../assets/css/supplier.css";
const SupplierCreateForm = () => {
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState({});

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
      default:
        break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3006/api/suppliers", {
        name,
        contactName,
        phoneNumber,
        email,
        address,
      });
      console.log("Supplier created:", response.data);

      // Reset form fields and errors
      setName("");
      setContactName("");
      setPhoneNumber("");
      setEmail("");
      setAddress("");
      setErrors({});
    } catch (error) {
      console.error("Error creating supplier:", error);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-lg">
        <form
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          onSubmit={handleSubmit}
        >
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Name:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              value={name}
              onChange={(event) => handleInputChange(event, "name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs italic">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="contactName"
            >
              Contact Name:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="contactName"
              type="text"
              value={contactName}
              onChange={(event) => handleInputChange(event, "contactName")}
            />
            {errors.contactName && (
              <p className="text-red-500 text-xs italic">
                {errors.contactName}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="phoneNumber"
            >
              Phone Number:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phoneNumber"
              type="text"
              value={phoneNumber}
              onChange={(event) => handleInputChange(event, "phoneNumber")}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs italic">
                {errors.phoneNumber}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="email"
            >
              Email:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={email}
              onChange={(event) => handleInputChange(event, "email")}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">{errors.email}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="address"
            >
              Address:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="address"
              type="text"
              value={address}
              onChange={(event) => handleInputChange(event, "address")}
            />
            {errors.address && (
              <p className="text-red-500 text-xs italic">{errors.address}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create Supplier
            </button>
            {/* <a
            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            href="#"
          >
            Forgot Password?
          </a> */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierCreateForm;
