import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
const url = "https://inventory-5yt3.onrender.com/api";
const MonthlyRevenueChart = ({ year }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // Fetch monthly revenue data from the API
    fetch(`${url}/monthly-revenue/${year}`)
      .then((response) => response.json())
      .then((monthlyRevenueData) => {
        const labels = Array.from({ length: 12 }, (_, i) => i + 1); // Months from 1 to 12
        const data = Array.from({ length: 12 }, (_, i) => {
          const monthData = monthlyRevenueData.find(
            (item) => item._id.month === i + 1
          );
          return monthData ? monthData.totalRevenue : 0;
        });

        // Create the chart
        const ctx = chartRef.current.getContext("2d");
        new Chart(ctx, {
          type: "line",
          data: {
            labels: labels.map((month) => monthNames[month - 1]), // Use monthNames array
            datasets: [
              {
                label: "Monthly Revenue",
                data: data,
                fill: true,
                borderColor: "rgba(75, 192, 192, 1)",
                tension: 0.4,
              },
            ],
          },
          options: {
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Total Revenue",
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
        console.error("Error fetching monthly revenue data:", error);
      });
  }, [year]);

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
      <h1 className="text-2xl font-bold mb-4">Monthly Revenue Analytics</h1>
      <div className="bg-white rounded-lg shadow-md p-4">
        <canvas ref={chartRef} width="300" height="150"></canvas>
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;
