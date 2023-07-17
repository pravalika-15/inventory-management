import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
const SupplierTable = () => {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    fetchSuppliers();
  }, []);
  const fetchSuppliers = async () => {
    try {
      const response = await axios.get("http://localhost:3006/api/suppliers");
      setSuppliers(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  const handleEdit = (supplierId) => {
    // Navigate to the edit route using the supplierId
    navigate(`/suppliers/${supplierId}/edit`);
  };

  const handleDelete = (supplierId) => {
    // Perform delete operation using the supplierId
    axios
      .delete(`http://localhost:3006/api/suppliers/${supplierId}`)
      .then(() => {
        // Remove the deleted supplier from the suppliers list
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

  return (
    <table>
      <thead>
        <tr>
          <th>Supplier Name</th>
          <th>Contact Name</th>
          <th>Phone Number</th>
          <th>Email Address</th>
          <th>Address</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {suppliers.map((supplier) => (
          <tr key={supplier._id}>
            <td>{supplier.name}</td>
            <td>{supplier.contactName}</td>
            <td>{supplier.phoneNumber}</td>
            <td>{supplier.email}</td>
            <td>{supplier.address}</td>
            <td>
              {/* Action buttons for editing/deleting the supplier */}
              <button onClick={() => handleEdit(supplier._id)}>Edit</button>
              <button onClick={() => handleDelete(supplier._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default SupplierTable;
