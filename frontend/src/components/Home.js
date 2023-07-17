import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../assets/images/11667324_20946011.jpg";

const Home = ({ onLogout }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is authenticated (e.g., by verifying a token in sessionStorage)
    const isAuthenticated = localStorage.getItem("token") !== null;
    setAuthenticated(isAuthenticated);
  }, []);

  const handleLogout = () => {
    // Clear the token from sessionStorage and update the authenticated state
    localStorage.removeItem("token");
    setAuthenticated(false);
    onLogout();
    navigate("/", { replace: true });
  };

  return (
    <div className="flex mb-4">
      <div className="w-1/2 bg-gray-500 h-screen p-10 flex items-center justify-center">
        <header>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to the Inventory Management System
          </h1>
          <p className="text-xl text-white">
            We provide a comprehensive solution for tracking and managing your
            products, orders, and suppliers.
          </p>
          <div className="mt-4">
            <Link
              to="/login"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Login
            </Link>
          </div>
        </header>

        {/* <div className="mt-8">
          {authenticated ? (
            <button
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block mr-4"
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block mr-4"
              >
                Login
              </Link>
              <Link
                to="/products"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
              >
                Products
              </Link>
            </>
          )}
        </div> */}
      </div>
      <div className="w-1/2 bg-gray-400 h-screen">
        <img src={heroImage} className="h-full" alt="Hero" />
      </div>
    </div>
  );
};

export default Home;
