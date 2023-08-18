import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import heroImage from "../assets/images/11667324_20946011.jpg";

const Home = ({ onLogout, userId }) => {
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
    <div className="flex flex-col-reverse lg:flex-row min-h-screen">
      <div className="lg:w-1/2 bg-blue-900 text-white p-8 flex flex-col justify-center items-center lg:items-start">
        <header className="text-center lg:text-left">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to the Inventory Management System
          </h1>
          <p className="text-lg mb-8">
            We provide a comprehensive solution for tracking and managing your
            products, orders, and suppliers.
          </p>
          {userId === "" && (
            <div className="mt-4">
              <Link
                to={{
                  pathname: "/login",
                  state: { from: window.location.pathname },
                }}
                className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded inline-block"
              >
                Login
              </Link>
            </div>
          )}
        </header>
      </div>
      <div className="lg:w-1/2 bg-gray-400 lg:h-screen h-3/4">
        <img
          src={heroImage}
          className="h-full w-full object-cover"
          alt="Hero"
        />
      </div>
    </div>
  );
};

export default Home;
