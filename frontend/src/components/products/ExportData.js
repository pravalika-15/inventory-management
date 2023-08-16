import React, { useState } from "react";
import axios from "axios";
const url = "https://inventory-5yt3.onrender.com/api";
const ExportData = () => {
  const [format, setFormat] = useState("csv");
  const [feedback, setFeedback] = useState({ message: "", isError: false });

  const handleExport = () => {
    axios
      .get(`${url}/products/export?format=${format}`)
      .then((response) => {
        // Create a temporary anchor element to trigger the download
        const link = document.createElement("a");
        link.href = `data:text/plain;charset=utf-8,${encodeURIComponent(
          response.data
        )}`;
        link.download = `products.${format}`;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setFeedback({ message: "Data exported successfully.", isError: false });
      })
      .catch((error) => {
        console.error("Export error:", error);
        setFeedback({
          message: "An error occurred during export.",
          isError: true,
        });
      });
  };

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold mb-2">Export Products</h2>
      <div className="flex items-center mb-2">
        <label htmlFor="format" className="mr-2">
          Format:
        </label>
        <select
          id="format"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="border border-gray-300 rounded py-2 px-4"
        >
          <option value="csv">CSV</option>
          <option value="excel">Excel</option>
        </select>
      </div>
      <button
        onClick={handleExport}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Export
      </button>
      {feedback.message && (
        <div
          className={`mt-4 p-2 ${
            feedback.isError ? "bg-red-500" : "bg-green-500"
          } text-white rounded`}
        >
          {feedback.message}
        </div>
      )}
    </div>
  );
};

export default ExportData;
