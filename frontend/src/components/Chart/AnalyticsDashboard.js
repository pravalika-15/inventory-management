import React, { useEffect } from "react";
import Chart from "chart.js/auto"; // Import the specific Chart component
const url = "https://inventory-5yt3.onrender.com/api";
const AnalyticsDashboard = () => {
  useEffect(() => {
    let myChart;

    // Fetch product sales data from your backend API
    fetch(`${url}/product-sales`)
      .then((response) => response.json())
      .then((productSalesData) => {
        // Extract labels and data for the chart
        const labels = productSalesData.map((item) => item.product);
        const data = productSalesData.map((item) => item.totalQuantitySold);

        // If a chart instance already exists, destroy it before creating a new one
        if (myChart) {
          myChart.destroy();
        }

        // Create the chart
        const ctx = document.getElementById("myChart").getContext("2d");
        myChart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "# of Units Sold",
                data: data,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
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
                  text: "Total Quantity Sold",
                },
              },
              x: {
                title: {
                  display: true,
                  text: "Product",
                },
              },
            },
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching product sales data:", error);
      });

    // Cleanup function
    return () => {
      if (myChart) {
        myChart.destroy();
      }
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Product Sales Analytics</h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <canvas id="myChart" width="300" height="150"></canvas>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
