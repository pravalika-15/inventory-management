import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
const url = "https://inventory-5yt3.onrender.com/api";
const CreateProduct = () => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [supplier, setSupplier] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newProduct = {
      name,
      category,
      price,
      description,
      supplier,
      quantity,
    };
    console.log(newProduct);

    try {
      const response = await fetch(`${url}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        // Product creation successful
        console.log("Product created successfully");
        navigate("/products");

        // Redirect to the product listing page or perform any other desired action
      } else {
        // Product creation failed
        const data = await response.json();
        setError(data.error);
        console.error("Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setError("Failed to create product");
    }
  };
  return (
    <div className="container mx-auto mt-8 px-5">
      <h2 className="text-2xl font-bold mb-4">Create Product</h2>
      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium">
            Category:
          </label>
          <input
            type="text"
            id="category"
            name="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-sm font-medium">
            Price:
          </label>
          <input
            type="text"
            id="price"
            name="price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            className="mt-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="supplier" className="block text-sm font-medium">
            Supplier:
          </label>
          <input
            type="text"
            id="supplier"
            name="supplier"
            value={supplier}
            onChange={(event) => setSupplier(event.target.value)}
            className="mt-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="quantity" className="block text-sm font-medium">
            Quantity:
          </label>
          <input
            type="text"
            id="quantity"
            name="quantity"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="mt-1 px-2 py-1 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm rounded-md"
            required
          />
        </div>
        {/* <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Create
        </button> */}

        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Create Product
          </button>
          <Link
            to="/products"
            className=" hover:text-gray-800 text-gray-400 font-bold py-2 px-4 rounded"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreateProduct;
