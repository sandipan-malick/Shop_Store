import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('https://shop-store-1-z2v0.onrender.com/api/user/check-email', {
        email: form.email,
      });

      if (res.status === 200) {
        // Navigate to OTP page and pass form data
        navigate('/register', {
          state: form,
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-800">
      <div className="w-full max-w-md p-8 text-white rounded-lg shadow-lg bg-zinc-900">
        <h2 className="mb-6 text-2xl font-bold text-center">Register</h2>

        {error && (
          <div className="mb-4 text-center text-red-500">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            placeholder="Enter your name"
            className="w-full h-10 px-4 placeholder-gray-400 rounded-md outline-none bg-zinc-700"
          />

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
            Send OTP
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-300">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:underline">Login</Link><br />
          <Link to="/login/forgetPassword" className="text-blue-400 hover:underline">Forget Password</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
