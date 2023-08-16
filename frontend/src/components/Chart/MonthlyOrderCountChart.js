import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
const url = "https://inventory-5yt3.onrender.com/api";
const MonthlyOrderCountChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Fetch monthly order count data from the API
    fetch(`${url}/monthly-order-count/2023`) // Replace with the appropriate API endpoint
      .then((response) => response.json())
      .then((monthlyOrderCountData) => {
        const labels = Array.from({ length: 12 }, (_, i) => i + 1); // Months from 1 to 12
        const data = Array.from({ length: 12 }, (_, i) => {
          const monthData = monthlyOrderCountData.find(
            (item) => item._id.month === i + 1
          );
          return monthData ? monthData.orderCount : 0;
        });

        // Create the chart
        const ctx = chartRef.current.getContext("2d");
        new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels.map((month) => monthNames[month - 1]), // Use monthNames array
            datasets: [
              {
                label: "Monthly Order Count",
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
      })
      .catch((error) => {
        console.error("Error fetching monthly order count data:", error);
      });
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Monthly Order Count Analytics</h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <canvas ref={chartRef} width="300" height="150"></canvas>
      </div>
    </div>
  );
};

export default MonthlyOrderCountChart;
