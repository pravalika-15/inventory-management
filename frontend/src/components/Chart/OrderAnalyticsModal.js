import React, { useEffect, useState, useRef } from "react";
import Chart from "chart.js/auto";
const url = "https://inventory-5yt3.onrender.com/api";
const OrderAnalyticsModal = ({ userId, onClose }) => {
  const [orderData, setOrderData] = useState([]);

  const chartRef = useRef(null);

  useEffect(() => {
    // Fetch order analytics data for the user from the API
    fetch(`${url}/order-analytics/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setOrderData(data);
      })
      .catch((error) => {
        console.error("Error fetching user order analytics data:", error);
      });
  }, [userId]);

  useEffect(() => {
    if (orderData.length === 0) return;

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const labels = monthNames;
    const data = orderData;
    // Destroy previous Chart instance if it exists
    if (chartRef.current && chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }
    // Create the chart
    const ctx = chartRef.current.getContext("2d");
    const newChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Number of Orders",
            data: data,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Number of Orders",
            },
          },
          x: {
            title: {
              display: true,
              text: "Month",
            },
          },
        },
      },
    });
    // Store the new chart instance in the ref
    chartRef.current.chart = newChart;
  }, [orderData]);

  const closeModal = () => {
    console.log("clicked!!");
    onClose();
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-4 rounded shadow-md max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Order Analytics</h3>
        <div className="bg-white rounded-lg shadow-md p-4">
          <canvas ref={chartRef} width="300" height="150"></canvas>
        </div>
        <div className="flex justify-end mt-4">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderAnalyticsModal;
