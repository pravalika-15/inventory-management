import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const Payments = () => {
  const { id } = useParams();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3006/api/suppliers/${id}/payments`
      );
      setPayments(response.data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        Payments for Supplier ID: {id}
      </h1>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="py-2 px-4 border-b">Payment ID</th>
            <th className="py-2 px-4 border-b">Amount</th>
            <th className="py-2 px-4 border-b">Currency</th>
            <th className="py-2 px-4 border-b">Date Created</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr key={payment._id}>
              <td className="py-2 px-4 border-b">{payment._id}</td>
              <td className="py-2 px-4 border-b">{payment.amount}</td>
              <td className="py-2 px-4 border-b">{payment.currency}</td>
              <td className="py-2 px-4 border-b">
                {new Date(payment.timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Payments;
