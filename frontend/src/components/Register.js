import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
const url = "https://inventory-5yt3.onrender.com/api";
function Register({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [userExists, setUserExists] = useState(false);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log(JSON.stringify({ username, password, phone, email }));
      const token = localStorage.getItem("token");
      const response = await fetch(`${url}/register`, {
        mode: "cors",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the "Bearer " prefix before the token
        },
        body: JSON.stringify({ username, password, phone, email }),
      });

      if (response.ok) {
        // Registration successful
        setError("");
        setServerError("");
        const data = await response.json();
        const token = data.token;

        // Store the token in local storage
        localStorage.setItem("token", token);
        onLogin(token);
        console.log("Registration successful");
        if (location.state && location.state.from) {
          navigate(location.state.from);
        } else {
          // If no previous location, navigate to "/products"
          navigate("/products");
        }
      } else {
        const errorData = await response.json();
        if (response.status === 400 && errorData.userExists) {
          // User already exists
          setUserExists(true);
          setError("");
          setServerError(errorData.error || "Failed to register user");
        } else {
          // Registration failed
          setError(errorData.error || "Failed to register user");
          setServerError("");
          setUserExists(false);
        }
      }
    } catch (error) {
      console.error("Error registering user:", error);
      setError("Failed to register user");
      setUserExists(false);
    }
  };

  return (
    <>
      {/* <div>
        <h2>Register</h2>
        {error && <p>{error}</p>}
        {userExists ? (
          <>
            <p>User already exists. Please login instead.</p>
            <Link to={{ pathname: "/login", state: { from: window.location.pathname } }}>
              <button>Login</button>
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div>
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
              />
            </div>
            <div>
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
              />
            </div>
            <div>
              <label>Phone:</label>
              <input type="text" value={phone} onChange={handlePhoneChange} />
            </div>
            <div>
              <label>Email:</label>
              <input type="email" value={email} onChange={handleEmailChange} />
            </div>
            <button type="submit">Register</button>
          </form>
        )}
        <div className="mt-2">
          <Link  to={{ pathname: "/login", state: { from: window.location.pathname } }}>Login</Link>
        </div>
      </div> */}
      <div className="gradient-form  h-screen flex items-center justify-center bg-neutral-200 dark:bg-neutral-700">
        <div className="container p-10">
          <div className="g-6 flex h-full flex-wrap items-center justify-center text-neutral-800 dark:text-neutral-200">
            <div className="w-full">
              <div className="block rounded-lg bg-white shadow-lg dark:bg-neutral-800">
                <div className="g-0 lg:flex lg:flex-wrap">
                  {/* Left column container*/}
                  <div className="px-4 md:px-0 lg:w-6/12">
                    <div className="md:mx-6 md:p-12">
                      {/* Logo */}
                      <div className="text-center">
                        <img
                          className="mx-auto w-48"
                          src="https://tecdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/lotus.webp"
                          alt="logo"
                        />
                        <h4 className="mb-12 mt-1 pb-1 text-xl font-semibold">
                          We are The Stock Central Team
                        </h4>
                      </div>
                      {error && <p>{error}</p>}
                      {serverError && (
                        <div className="mb-2 text-red-500">{serverError}</div>
                      )}
                      <form onSubmit={handleSubmit}>
                        {/* {userExists ? (
                          <>
                            <p>User already exists. Please login instead.</p>
                            <Link
                              to={{
                                pathname: "/login",
                                state: { from: window.location.pathname },
                              }}
                            >
                              <button>Login</button>
                            </Link>
                          </>
                        ) : ( */}
                        <>
                          <div
                            className="relative mb-4"
                            data-te-input-wrapper-init
                          >
                            <input
                              type="text"
                              className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                              id="exampleFormControlInput1"
                              placeholder="Username"
                              value={username}
                              onChange={handleUsernameChange}
                            />
                            <label
                              htmlFor="exampleFormControlInput1"
                              className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                            >
                              Username
                            </label>
                          </div>

                          <div
                            className="relative mb-4"
                            data-te-input-wrapper-init
                          >
                            <input
                              type="password"
                              className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                              id="exampleFormControlInput11"
                              placeholder="Password"
                              value={password}
                              onChange={handlePasswordChange}
                            />
                            <label
                              htmlFor="exampleFormControlInput11"
                              className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                            >
                              Password
                            </label>
                          </div>

                          <div
                            className="relative mb-4"
                            data-te-input-wrapper-init
                          >
                            <input
                              type="text"
                              className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                              id="exampleFormControlInput12"
                              placeholder="Phone"
                              value={phone}
                              onChange={handlePhoneChange}
                            />
                            <label
                              htmlFor="exampleFormControlInput12"
                              className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                            >
                              Phone
                            </label>
                          </div>

                          <div
                            className="relative mb-4"
                            data-te-input-wrapper-init
                          >
                            <input
                              type="email"
                              className="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                              id="exampleFormControlInput13"
                              placeholder="Email"
                              value={email}
                              onChange={handleEmailChange}
                            />
                            <label
                              htmlFor="exampleFormControlInput13"
                              className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                            >
                              Email
                            </label>
                          </div>

                          <div className="flex justify-between items-center mt-4">
                            <button
                              type="submit"
                              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                            >
                              Register
                            </button>
                            <Link
                              to={{
                                pathname: "/login",
                                state: { from: window.location.pathname },
                              }}
                            >
                              <button
                                type="button"
                                className="bg-0 text-gray-400 py-2 px-4 rounded"
                              >
                                Login
                              </button>
                            </Link>
                          </div>
                        </>
                        {/* )} */}
                      </form>
                    </div>
                  </div>

                  {/* Right column container with background and description */}
                  <div
                    className="flex items-center rounded-b-lg lg:w-6/12 lg:rounded-r-lg lg:rounded-bl-none"
                    style={{
                      background:
                        "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
                    }}
                  >
                    <div className="px-4 py-6 text-white md:mx-6 md:p-12">
                      <h4 className="mb-6 text-xl font-semibold">
                        We are more than just a company
                      </h4>
                      <p className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit, sed do eiusmodtempor incididunt ut labore et
                        dolore magna aliqua. Ut enim ad minim veniam, quis
                        nostrud exercitation ullamco laboris nisi ut aliquip ex
                        ea commodo consequat.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
