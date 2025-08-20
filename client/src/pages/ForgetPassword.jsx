// src/pages/ForgetPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post(
        "https://shop-store-1-z2v0.onrender.com/api/user/forgot-password",
        { email }
      );

      setMessage(res.data.message);

      // Navigate to OTP verification page and pass email
      navigate("/forget/otp/verify", { state: { userData: { email } } });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-800">
      <div className="w-full max-w-md p-8 text-white rounded-lg shadow-lg bg-zinc-900">
        <h2 className="mb-4 text-2xl font-bold text-center">Forgot Password</h2>
        <p className="mb-6 text-center text-blue-400">
          Enter your registered email to receive a password reset OTP.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Your Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 px-4 placeholder-gray-400 rounded-md outline-none bg-zinc-700"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-10 px-4 text-white rounded-md font-medium ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
            }`}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-center text-green-400">{message}</p>}
        {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}

        <p className="mt-6 text-sm text-center text-gray-300">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-400 hover:underline">
            Go to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgetPassword;
