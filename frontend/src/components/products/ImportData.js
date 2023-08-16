import React, { useState } from "react";
import axios from "axios";
const url = "https://inventory-5yt3.onrender.com/api";
const ImportData = () => {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState({ message: "", isError: false });

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setFeedback({ message: "", isError: false });
  };

  const handleImport = () => {
    if (!file) {
      setFeedback({
        message: "Please select a file to import.",
        isError: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    axios
      .post(`${url}/products/import`, formData)
      .then((response) => {
        setFeedback({
          message: response.data.message,
          isError: response.data.error,
        });
      })
      .catch((error) => {
        console.error("Import error:", error);
        setFeedback({
          message: "An error occurred during import.",
          isError: true,
        });
      });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Import Products Data</h1>
      <p>
        (keep the headers, Name,Price,Description,Category,Quantity,Supplier)
      </p>
      <input type="file" onChange={handleFileChange} className="mb-2" />
      <button
        onClick={handleImport}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        Import
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

export default ImportData;
