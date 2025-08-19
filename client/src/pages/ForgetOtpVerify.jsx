import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const ForgetOtpVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state?.userData || {};
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post("https://shop-store-1-z2v0.onrender.com/api/user/verify-forget-otp", {
        otp,
        email: userData.email,
      });

      alert(response.data.message);

      // ✅ Navigate to reset password page and pass the email
      navigate("/new/password", {
        state: { email: userData.email },
      });
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <div className="w-full max-w-md p-8 text-white rounded shadow bg-zinc-800">
        <h2 className="mb-6 text-2xl font-bold text-center">Verify OTP</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block mb-1 text-sm font-medium">
              Enter OTP
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 text-white rounded bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the OTP sent to your email"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-center text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 font-semibold transition-colors duration-200 bg-blue-600 rounded hover:bg-blue-700"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgetOtpVerify;
