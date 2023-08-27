import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa"; // Import the cart icon
const url = "https://inventory-5yt3.onrender.com/api";
const NavBar = ({
  authenticated,
  onLogout,
  userData,
  isMenuOpen,
  setMenuOpen,
}) => {
  // const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const isLoggedIn = authenticated;
  const navigate = useNavigate();
  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };
  const handleClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(!isDropdownOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };
  const handleLogout = () => {
    onLogout();
    navigate("/");
  };
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const role = userData ? userData.role : "user";

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="https://sensational-muffin-3ff308.netlify.app/"
            className="flex items-center"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/128/3649/3649531.png"
              className="h-8 mr-3"
              alt="stockCentral Logo"
            />
            <span className="self-center text-xl text-black-100 font-semibold whitespace-nowrap dark:text-white hidden md:inline">
              StockCentral
            </span>
          </a>
          <div className="flex md:order-2">
            {isLoggedIn ? (
              <ul>
                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center md:dark:text-blue-500"
                  >
                    Logout
                  </button>
                </li>
                {role === "user" && (
                  <li>
                    <Link to="/cart">
                      <FaShoppingCart className="text-2xl text-gray-700 ml-4 hover:text-blue-700" />
                    </Link>
                  </li>
                )}
              </ul>
            ) : (
              <>
                <ul>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/login", {
                          state: { from: window.location.pathname },
                        })
                      }
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center mr-2 md:mr-0 md:dark:text-blue-500"
                    >
                      Login
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        navigate("/register", {
                          state: { from: window.location.pathname },
                        })
                      }
                      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center md:dark:text-blue-500"
                    >
                      Register
                    </button>
                  </li>
                </ul>
              </>
            )}
            <button
              type="button"
              ref={menuRef}
              className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
              aria-controls="navbar-sticky"
              aria-expanded={isMenuOpen}
              onClick={toggleMenu}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className={`items-center justify-between ${
              isMenuOpen ? "block" : "hidden"
            } w-full md:flex md:w-auto md:order-1`}
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
              <li>
                <Link
                  to="/"
                  className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  aria-current="page"
                  onClick={closeMenu}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  onClick={closeMenu}
                  className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  onClick={closeMenu}
                  className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                >
                  Orders
                </Link>
              </li>

              {role === "admin" && (
                <li>
                  <Link
                    to="/suppliers"
                    onClick={closeMenu}
                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Suppliers
                  </Link>
                </li>
              )}
              {role === "admin" && (
                <li>
                  <Link
                    to="/users"
                    onClick={closeMenu}
                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Users
                  </Link>
                </li>
              )}
              {role === "admin" && (
                <li>
                  <Link
                    to="/chart"
                    onClick={closeMenu}
                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Chart
                  </Link>
                </li>
              )}

              {/* {role === "user" && (
                <li>
                  <Link
                    to="/create-order"
                    className="block py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                  >
                    Create a new Order
                  </Link>
                </li>
              )} */}

              {role === "admin" ? (
                <li className="relative">
                  <button
                    type="button"
                    className="flex items-center justify-between w-full py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:dark:hover:text-blue-500 dark:text-white dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent dark:border-gray-700"
                    onClick={handleClick}
                  >
                    Create{" "}
                    <svg
                      className={`w-4 h-4 ml-2 mt-1 transform ${
                        isDropdownOpen ? "rotate-0" : "rotate-180"
                      } transition-transform duration-200`}
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3.293l-6.94 6.94a1 1 0 0 0 1.413 1.414L10 5.414l5.527 5.527a1 1 0 0 0 1.414-1.414L10 3.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 py-2 w-44 bg-white rounded-lg shadow-md dark:bg-gray-700">
                      {/* <Link
                        to="/create-order"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                      >
                        Create Order
                      </Link> */}

                      <Link
                        to="/create-supplier"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                        onClick={() => {
                          setDropdownOpen(false);
                          closeMenu();
                        }}
                      >
                        Create Supplier
                      </Link>

                      <Link
                        to="/create-product"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-600"
                        onClick={() => {
                          setDropdownOpen(false);
                          closeMenu();
                        }}
                      >
                        Create Product
                      </Link>
                    </div>
                  )}
                </li>
              ) : null}
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
