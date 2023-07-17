import React, { useEffect, useState } from "react";

const ProductListing = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    handlePagination(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handlePagination = (page, search = "") => {
    fetch(`http://localhost:3006/api/products?page=${page}&search=${search}`)
      .then((response) => response.json())
      .then((data) => {
        setProducts(data.products);
        console.log(data.products);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        console.error(error);
        // Handle error case
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
    handlePagination(1, searchQuery.trim());
  };

  return (
    <>
      <div className="search">
        <input
          type="text"
          id="search-input"
          placeholder="Search products"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button id="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
      <main>
        <h1 className="text-3xl font-bold mb-8">Product Listing</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-4">{product.name}</h2>
              <p className="text-gray-600 mb-2">Category: {product.category}</p>
              <p className="text-gray-600 mb-2">
                Price: ${product.price.toFixed(2)}
              </p>
              <p className="text-gray-600 mb-4">{product.description}</p>
              {/* Display supplier information */}
              <p className="text-gray-700">Supplier: {product.supplier.name}</p>
              <p className="text-gray-700">
                Contact: {product.supplier.phoneNumber}
              </p>
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
    </>
  );
};

export default ProductListing;
