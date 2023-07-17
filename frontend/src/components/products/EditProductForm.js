import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const EditProduct = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    description: "",
    supplier: "",
    quantity: "",
  });

  useEffect(() => {
    // Fetch product data from the server using the provided ID
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:3006/products/${id}`);
        if (response.ok) {
          const product = await response.json();
          setProductData(product);
        } else {
          console.error("Failed to fetch product data");
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:3006/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        // Product update successful
        console.log("Product updated successfully");
        // Redirect to the product listing page or perform any other desired action
      } else {
        // Product update failed
        console.error("Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Edit Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="id" className="block text-sm font-medium">
            ID:
          </label>
          <input
            type="text"
            id="id"
            name="id"
            value={productData.id}
            onChange={handleChange}
            className="mt-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={productData.name}
            onChange={handleChange}
            className="mt-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            required
          />
        </div>
        {/* Repeat the above pattern for other product fields */}
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
