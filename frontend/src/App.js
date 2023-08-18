import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import jwtDecode from "jwt-decode";
import Home from "./components/Home";
import "./assets/css/styles.css";
import ProductListing from "./components/products/ProductListing";
import OrderList from "./components/orders/OrderList";
import OrderForm from "./components/orders/OrderForm";
import OrderEditForm from "./components/orders/OrderEditForm";
import SupplierCreateForm from "./components/suppliers/CreateSupplier";
import SupplierTable from "./components/suppliers/Suppliers";
import SupplierEditForm from "./components/suppliers/SupplierEditForm";
import LoginPage from "./components/LoginPage";
import NavBar from "./components/Navbar";
import Register from "./components/Register";
import CreateProduct from "./components/products/CreateProduct";
import EditProduct from "./components/products/EditProductForm";
import Payments from "./components/suppliers/Payments";
import Users from "./components/Users/UsersDisplay";
import axios from "axios";
import Cart from "./components/Cart/Cart";
import PageNotFound from "./components/PageNotFound";
import ImportData from "./components/products/ImportData";
import AnalyticsDashboard from "./components/Chart/AnalyticsDashboard";
import CustomerOrderAnalytics from "./components/Chart/CustomerOrderAnalytics";
import MonthlyRevenueChart from "./components/Chart/MonthlyRevenueChart";
import Chart from "./components/Charts";
const url = "https://inventory-5yt3.onrender.com/api";
function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userId, setUserId] = useState(""); // Add state for storing user role
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchingUserData, setFetchingUserData] = useState(true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    // Check if the user is authenticated by verifying the token in sessionStorage
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = new Date().getTime();
      // console.log(decodedToken.exp * 1000);
      // console.log(currentTime);
      if (decodedToken.exp * 1000 > currentTime) {
        setAuthenticated(true);
        setUserId(decodedToken.userId);
        console.log(decodedToken.exp * 1000 > currentTime);
      } else {
        console.log("else code ");
        localStorage.removeItem("token");
        setUserId("");
        setUserData(null);
      }
    }

    // console.log("useeffect");
    console.log(token);
    console.log(authenticated);
    console.log(userData);
    console.log(userId);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (userId) {
      setFetchingUserData(true);
      fetchUserData(userId);
    }
  }, [userId]);

  useEffect(() => {
    console.log("authenticated:", authenticated);
    console.log("userId:", userId);
    console.log("userData:", userData);
  }, [authenticated, userId, userData]);

  const fetchUserData = async (userId) => {
    try {
      const response = await axios.get(`${url}/users/${userId}`);
      setUserData(response.data);
      console.log("user data", userData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    } finally {
      setFetchingUserData(false); // Done fetching user data
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setAuthenticated(true);

    const decodedToken = jwtDecode(token);
    console.log(decodedToken);
    setUserId(decodedToken.userId); // Store the user role in state
    console.log(decodedToken.userId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
    setUserId(""); // Clear the user role from state
  };

  const role = userData ? userData.role : "user";

  return (
    <>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Router>
            <NavBar
              authenticated={authenticated}
              onLogout={handleLogout}
              userData={userData}
              isMenuOpen={isMenuOpen}
              setMenuOpen={setMenuOpen}
            />
            <div style={{ paddingTop: "4rem" }}></div>
            <Routes>
              <Route
                path="/"
                element={<Home onLogout={handleLogout} userId={userId} />}
              />
              {!authenticated && (
                <>
                  <Route
                    path="/login"
                    element={<LoginPage onLogin={handleLogin} />}
                  />
                  <Route
                    path="/register"
                    element={<Register onLogin={handleLogin} />}
                  />
                </>
              )}

              {authenticated && (
                <>
                  <Route path="/login" element={<Navigate to="/" replace />} />
                  <Route
                    path="/register"
                    element={<Navigate to="/" replace />}
                  />
                </>
              )}

              <Route
                path="/products"
                element={<ProductListing role={role} userId={userId} />}
              />

              {authenticated && (
                <>
                  {fetchingUserData ? (
                    <>Loading user data...</>
                  ) : (
                    <Route
                      path="/orders"
                      element={
                        <OrderList
                          role={role}
                          userId={userId}
                          userData={userData}
                        />
                      }
                    />
                  )}
                </>
              )}

              {authenticated && role === "admin" && (
                <>
                  <Route
                    path="/create-supplier"
                    element={<SupplierCreateForm />}
                  />
                  <Route
                    path="/suppliers/:id/edit"
                    element={<SupplierEditForm />}
                  />
                  <Route path="/suppliers" element={<SupplierTable />} />
                  <Route path="/create-product" element={<CreateProduct />} />
                  <Route path="/products/:id/edit" element={<EditProduct />} />
                  <Route
                    path="/suppliers/:id/payments"
                    element={<Payments />}
                  />
                  <Route path="/users" element={<Users userRole={userId} />} />
                  <Route
                    path="/products/import-data"
                    element={<ImportData userRole={userData} />}
                  />
                  <Route path="/chart" element={<Chart />} />
                  {/* <Route path="/analytics" element={<AnalyticsDashboard />} />
                  <Route
                    path="/order-analytics"
                    element={<CustomerOrderAnalytics />}
                  />
                  <Route
                    path="/monthly-revenue-analytics"
                    element={<MonthlyRevenueChart />}
                  /> */}
                </>
              )}

              {authenticated && role === "user" && (
                <>
                  <Route
                    path="/create-order"
                    element={<OrderForm userId={userId} />}
                  />
                  <Route path="/orders/:id/edit" element={<OrderEditForm />} />
                  <Route path="/cart" element={<Cart userId={userId} />} />
                </>
              )}

              {/* {authenticated && (
            <Route path="/users" element={<Users userRole={userId} />} />
          )} */}

              {!authenticated && (
                <Route path="*" element={<Navigate to="/login" replace />} />
              )}

              <Route path="*" element={<PageNotFound />} />

              {/* Protected Routes */}
            </Routes>
          </Router>
        </>
      )}
    </>
  );
}

export default App;
