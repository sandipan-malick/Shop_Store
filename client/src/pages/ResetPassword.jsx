// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || ""; // email passed from OTP page

  const [email, setEmail] = useState(emailFromState);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!emailFromState) {
      // Redirect if no email is passed (user navigated manually)
      navigate("/login");
    }
  }, [emailFromState, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword.trim()) {
      return setError("❌ New password is required.");
    }

    if (newPassword.length < 6) {
      return setError("❌ Password must be at least 6 characters.");
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "https://shop-store-1-z2v0.onrender.com/api/user/reset-password",
        { email, newPassword }
      );

      setMessage(res.data.message || "Password successfully reset.");
      setError("");

      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-800">
      <div className="w-full max-w-md p-8 text-white rounded-lg shadow-lg bg-zinc-900">
        <h2 className="mb-6 text-2xl font-bold text-center">Reset Password</h2>

        <form className="flex flex-col space-y-4" onSubmit={handleReset}>
          <input
            type="email"
            value={email}
            disabled
            className="w-full h-10 px-4 placeholder-gray-400 rounded-md outline-none cursor-not-allowed bg-zinc-700"
          />
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-10 px-4 placeholder-gray-400 rounded-md outline-none bg-zinc-700"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-10 px-4 font-semibold text-white rounded-md ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
            }`}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-center text-green-400">{message}</p>}
        {error && <p className="mt-4 text-sm text-center text-red-400">{error}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
