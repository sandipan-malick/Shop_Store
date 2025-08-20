// src/pages/OtpVerify.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function OtpVerify() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes
  const [resendDisabled, setResendDisabled] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state;

  const formatTime = (secs) => {
    const min = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const sec = (secs % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Timer countdown effect
  useEffect(() => {
    let interval;
    if (resendDisabled && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [resendDisabled, timer]);

  // Submit OTP for verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        'https://shop-store-1-z2v0.onrender.com/api/user/verify-otp',
        {
          otp,
          username: userData.username,
          email: userData.email,
          password: userData.password,
        }
      );

      alert(response.data.message);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      await axios.post('https://shop-store-1-z2v0.onrender.com/api/user/send-otp', {
        email: userData.email,
      });
      alert('OTP resent to your email.');
      setTimer(300); // Reset 5 minutes
      setResendDisabled(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-800">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-6 space-y-4 rounded shadow-md bg-zinc-900"
      >
        <h2 className="text-xl font-bold text-center">Enter OTP</h2>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full h-10 px-4 text-white placeholder-gray-400 rounded outline-none bg-zinc-700"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>
            Didn’t get the OTP?{' '}
            <button
              type="button"
              onClick={handleResend}
              disabled={resendDisabled}
              className={`ml-1 underline ${
                resendDisabled ? 'text-gray-500' : 'text-blue-400 hover:text-blue-200'
              }`}
            >
              Resend {resendDisabled ? `(${formatTime(timer)})` : ''}
            </button>
          </span>
        </div>
      </form>
    </div>
  );
}

export default OtpVerify;
