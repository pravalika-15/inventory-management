import React, { useEffect, useState } from "react";
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
function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated by verifying the token in sessionStorage
    const token = localStorage.getItem("token");
    if (token) {
      const decodedToken = jwtDecode(token);
      const currentTime = new Date().getTime();
      console.log(decodedToken.exp * 1000);
      console.log(currentTime);
      if (decodedToken.exp * 1000 > currentTime) {
        setAuthenticated(true);
        console.log(decodedToken.exp * 1000 > currentTime);
      } else {
        localStorage.removeItem("token");
      }
    }

    console.log("useeffect");
    console.log(token);
    console.log(authenticated);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setAuthenticated(false);
  };

  return (
    <>
      <Router>
        <NavBar authenticated={authenticated} onLogout={handleLogout} />
        <div style={{ paddingTop: "64px" }}></div>
        <Routes>
          <Route path="/" element={<Home onLogout={handleLogout} />} />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route
            path="/register"
            element={<Register onLogin={handleLogin} />}
          />
          <Route path="/products" element={<ProductListing />} />

          {console.log(authenticated)}
          {authenticated && <Route path="/orders" element={<OrderList />} />}
          {authenticated && (
            <Route path="/create-order" element={<OrderForm />} />
          )}
          {authenticated && (
            <Route path="/orders/:id/edit" element={<OrderEditForm />} />
          )}
          {authenticated && (
            <Route path="/create-supplier" element={<SupplierCreateForm />} />
          )}
          {authenticated && (
            <Route path="/suppliers/:id/edit" element={<SupplierEditForm />} />
          )}
          {authenticated && (
            <Route path="/suppliers" element={<SupplierTable />} />
          )}
          {authenticated && (
            <Route path="/create-product" element={<CreateProduct />} />
          )}
          {authenticated && (
            <Route path="/edit-product" element={<EditProduct />} />
          )}
          {!authenticated && (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}

          {/* Protected Routes */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
