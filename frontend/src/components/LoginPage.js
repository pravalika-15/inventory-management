// import { useState, useEffect } from "react";
// import jwtDecode from "jwt-decode";

// const CLIENT_ID =
//   "991531767216-3d17vb0v82fmfv5suj8ljifqhlotslcm.apps.googleusercontent.com";

// function LoginPage() {
//   const [user, setUser] = useState({});

//   const handleCredentialResponse = (response) => {
//     console.log("response");
//     // console.log(response.credential);
//     let userObject = jwtDecode(response.credential);
//     console.log(userObject);
//     setUser(userObject);
//     // console.log(user);
//     document.getElementById("signInDiv").hidden = true;
//     document.getElementById("signIn").hidden = true;

//     // Check if the user exists in the database
//     checkUserExists(userObject.sub);
//   };

//   const handleLogout = () => {
//     setUser({});
//     document.getElementById("signInDiv").hidden = false;
//     document.getElementById("profile").hidden = true;
//   };

//   const checkUserExists = async (sub) => {
//     try {
//       console.log("checking!!");
//       const response = await fetch(`${url}/users/${sub}`);
//       const userExists = await response.json();
//       console.log(response.ok);

//       if (!response.ok) {
//         // User does not exist in the database, add them as a new user
//         // console.log(user);
//         addUserToDatabase(user);
//       } else {
//         console.log("User exists in the database");
//         // User exists, perform login actions here if required
//       }
//     } catch (error) {
//       console.error("Error checking user:", error);
//     }
//   };

//   const addUserToDatabase = async (user) => {
//     try {
//       // console.log("addUserToDatabase");
//       console.log(user);
//       const response = await fetch("http://localhost:3006/api/users", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(user),
//       });

//       if (response.ok) {
//         console.log("User added to database");
//       } else {
//         console.error("Failed to add user to database");
//       }
//     } catch (error) {
//       console.error("Error adding user to database:", error);
//     }
//   };

//   useEffect(() => {
//     /*global google*/
//     google.accounts.id.initialize({
//       client_id: CLIENT_ID,
//       callback: handleCredentialResponse,
//       scope: "email",
//       ux_mode: "popup",
//     });
//     google.accounts.id.renderButton(document.getElementById("signInDiv"), {
//       theme: "outline",
//       size: "large",
//     });
//   }, []);

//   return (
//     <>
//       <div
//         className="flex flex-col items-center justify-center h-screen bg-cover bg-center"
//         style={{
//           backgroundImage:
//             "url('https://img.freepik.com/free-vector/background-realistic-abstract-technology-particle_23-2148431735.jpg?w=2000&t=st=1688800372~exp=1688800972~hmac=8b8859b5d2d2a3272ec139cf088679edc86c98de1dca3e5800b46d3419ddec53')",
//         }}
//       >
//         <div className="max-w-md px-6 py-8 bg-white rounded-lg shadow-lg">
//           <h2 className="text-2xl font-bold mb-8" id="signIn">
//             Sign In
//           </h2>
//           <div>
//             <div id="signInDiv"></div>
//             {Object.keys(user).length !== 0 && (
//               <button
//                 className="text-2xl font-bold mb-8"
//                 onClick={handleLogout}
//               >
//                 SignOut
//               </button>
//             )}
//             {user && (
//               <div>
//                 <h1>{user.name}</h1>
//                 {user.picture && (
//                   <img alt="profile" id="profile" src={user.picture} />
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default LoginPage;

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const url = "https://inventory-5yt3.onrender.com/api";
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      // console.log(JSON.stringify({ username, password }));
      const response = await fetch(`${url}/login`, {
        mode: "cors",
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Include the auth token in the Authorization header
        },
        body: JSON.stringify({ username, password }),
      });
      if (response.ok) {
        // Login successful
        const { token } = await response.json();
        console.log("Token:", token);
        localStorage.setItem("token", token);
        onLogin(token);
        setError("");
        console.log("Login successful");
        console.log("state", location);
        if (location.state && location.state.from) {
          console.log(location.state.from);
          navigate(location.state.from);
        } else {
          // If no previous location, navigate to "/products"
          navigate("/products");
        }
      } else {
        // Login failed
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Failed to login");
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Sign in to your account
          </h2>
        </div>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Username
              </label>
              <div className="mt-2">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  autoComplete="username"
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
                {/* <div className="text-sm">
                  <a
                    href="#"
                    class="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </a>
                </div> */}
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            {/* <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign in
              </button>
            </div> */}

            <div className="flex justify-between items-center mt-4">
              <button
                type="submit"
                className="bg-indigo-600  hover:bg-indigo-500  text-white font-bold py-2 px-4 rounded"
              >
                Sign in
              </button>
              <Link
                to={{
                  pathname: "/register",
                  state: { from: window.location.pathname },
                }}
              >
                <button
                  type="button"
                  className="bg-0 text-gray-400 py-2 px-4 rounded hover:text-black"
                >
                  Register
                </button>
              </Link>
            </div>
          </form>

          {/* <p class="mt-10 text-center text-sm text-gray-500">
            Not a member?
            <a
              href="#"
              class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500"
            >
              Start a 14 day free trial
            </a>
          </p> */}
        </div>
      </div>
      {/* 
      <div>
        <h2 className="text-2xl font-bold">Login</h2>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block font-bold">Username:</label>
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold">Password:</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              className="border border-gray-300 rounded px-3 py-2 w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </button>
        </form>
        <div className="mt-2">
          <Link
            to="/register"
            className="text-blue-500 hover:text-blue-700 font-bold"
          >
            Register
          </Link>
        </div>
      </div> */}
    </>
  );
}

export default Login;
