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
    if (loading) return; // prevent double click

    setLoading(true);
    try {
      const res = await axios.post("https://shop-store-1-z2v0.onrender.com/api/user/forgot-password", { email });
      setMessage(res.data.message);
      setError("");
      navigate("/forget/otp/verify", {
        state : {email},
      })
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setMessage("");
    } finally {
      setLoading(false); // reset loading state

    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-800">
      <div className="w-full max-w-md p-8 text-white rounded-lg shadow-lg bg-zinc-900">
        <h2 className="mb-4 text-2xl font-bold text-center">Forgot Password</h2>
        <p className="mb-6 text-center text-blue-400">
          Enter your registered email to receive a password reset link.
        </p>

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            className="w-full h-10 px-4 placeholder-gray-400 rounded-md outline-none bg-zinc-700"
            placeholder="Your Registered Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading} // disable when loading
            className={`w-full h-10 px-4 font-serif text-white rounded-md outline-none ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-green-500 hover:bg-green-700"
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
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
