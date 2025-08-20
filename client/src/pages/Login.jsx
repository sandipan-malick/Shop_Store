// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0); // track invalid attempts
  const MAX_ATTEMPTS = 5; // maximum invalid attempts

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const res = await axios.post(
        "https://shop-store-1-z2v0.onrender.com/api/user/login",
        form,
        { withCredentials: true } // include cookies if backend sets token
      );

      console.log("Login response:", res.status, res.data);

      // ✅ accept any 2xx response as success
      if (res.status >= 200 && res.status < 300) {
        setAttempts(0); // reset failed attempts
        navigate("/"); // go to dashboard/home
      }
    } catch (err) {
      // increment attempts only on actual failure
      setAttempts((prev) => prev + 1);

      setError(err.response?.data?.error || "Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-800">
      <div className="w-full max-w-md p-8 text-white rounded-lg shadow-lg bg-zinc-900">
        <h2 className="mb-6 text-2xl font-bold text-center">Login</h2>

        {/* Error Message */}
        {error && <div className="mb-2 text-center text-red-500">{error}</div>}

        {/* Show attempts if > 0 */}
        {attempts > 0 && (
          <div className="mb-4 text-center text-yellow-400">
            Invalid attempts: {attempts}/{MAX_ATTEMPTS}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="w-full h-10 px-4 placeholder-gray-400 rounded-md outline-none bg-zinc-700"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="w-full h-10 px-4 placeholder-gray-400 rounded-md outline-none bg-zinc-700"
          />

          <button
            type="submit"
            disabled={attempts >= MAX_ATTEMPTS} // disable after too many attempts
            className={`w-full h-10 px-4 text-white rounded-md ${
              attempts >= MAX_ATTEMPTS
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {attempts >= MAX_ATTEMPTS ? "Blocked" : "Login"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-300">
          Don't have an account?{" "}
          <Link to="/registerPage" className="text-blue-400 hover:underline">
            Register
          </Link>
          <br />
          <Link
            to="/login/forgetPassword"
            className="text-blue-400 hover:underline"
          >
            Forget Password
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
