import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const SupplierEditForm = () => {
  const { id } = useParams();
  const [supplier, setSupplier] = useState(null);
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the existing supplier data from the backend API
    axios
      .get(` http://localhost:3006/api/suppliers/${id}`)
      .then((response) => {
        setSupplier(response.data);
        setName(response.data.name);
        setContactName(response.data.contactName);
        setPhoneNumber(response.data.phoneNumber);
        setEmail(response.data.email);
        setAddress(response.data.address);
      })
      .catch((error) => {
        console.error("Error fetching supplier:", error);
      });
  }, [id]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Update the supplier using the modified data
    const updatedSupplier = {
      ...supplier,
      name,
      contactName,
      phoneNumber,
      email,
      address,
    };

    // Send the updated supplier data to the backend API
    axios
      .put(`http://localhost:3006/api/suppliers/${id}`, updatedSupplier)
      .then((response) => {
        console.log("Supplier updated:", response.data);
        navigate("/suppliers");
      })
      .catch((error) => {
        console.error("Error updating supplier:", error);
      });
  };

  if (!supplier) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>Edit Supplier: {supplier.name}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Supplier Name:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <label htmlFor="contactName">Contact Name:</label>
        <input
          type="text"
          id="contactName"
          value={contactName}
          onChange={(event) => setContactName(event.target.value)}
        />

        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="text"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />

        <label htmlFor="email">Email Address:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        <label htmlFor="address">Address:</label>
        <input
          type="text"
          id="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />

        <button type="submit">Update Supplier</button>
      </form>
    </div>
  );
};

export default SupplierEditForm;
