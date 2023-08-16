import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
const url = "https://inventory-5yt3.onrender.com/api";
const CustomerOrderAnalytics = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Fetch customer order data from the API
    fetch(`${url}/customer-orders`)
      .then((response) => response.json())
      .then((customerOrderData) => {
        const labels = customerOrderData.map((item) => item._id);
        const data = customerOrderData.map((item) => item.totalQuantityOrdered);

        // Create the chart
        const ctx = chartRef.current.getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Total Quantity Ordered",
                data: data,
                backgroundColor: "rgba(54, 162, 235, 0.2)",
                borderColor: "rgba(54, 162, 235, 1)",
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
                  text: "Total Quantity Ordered",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "User ID",
                },
              },
            },
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching customer order data:", error);
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Customer Order Analytics</h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <canvas ref={chartRef} width="300" height="150"></canvas>
      </div>
    </div>
  );
};

export default CustomerOrderAnalytics;
