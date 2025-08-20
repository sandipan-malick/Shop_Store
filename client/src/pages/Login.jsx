// src/pages/Login.jsx
import React, { cache, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "https://shop-store-1-z2v0.onrender.com/api/user/login",
        form,
        { withCredentials: true }
      );
      navigate("/dashboard"); // only after login succeeds
    } catch (err) {
      console.error(err.response?.data?.error || "Login failed");
      alert(err.response?.data?.error || "Invalid credentials");
    }


  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-800">
      <div className="w-full max-w-md p-8 text-white rounded-lg shadow-lg bg-zinc-900">
        <h2 className="mb-6 text-2xl font-bold text-center">Login</h2>
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
            className="w-full h-10 px-4 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-300">
          Don't have an account?{" "}
          <Link to="/" className="text-blue-400 hover:underline">Register</Link>
          <br />
          <Link to="/login/forgetPassword" className="text-blue-400 hover:underline">Forget Password</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
