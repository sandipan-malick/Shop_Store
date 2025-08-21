import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import FullDetailed from "./FullDetailed";
import Footer from "./Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Check authentication by verifying cookie with backend
  const checkAuth = async () => {
    try {
      const res = await axios.get(
        "https://shop-store-1-z2v0.onrender.com/dashboard",
        { withCredentials: true } // important for cookies
      );

      console.log("Auth successful:", res.data);
      setLoading(false); // auth passed, show dashboard
    } catch (err) {
      console.error("Auth failed:", err.response?.data || err.message);

      // Redirect to login if unauthorized
      if (err.response && err.response.status === 401) {
        navigate("/login");
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Show loading while verifying auth
  if (loading) {
    return (
      <div className="text-white text-center mt-20">
        Checking authentication...
      </div>
    );
  }

  // Show error if auth check failed
  if (error) {
    return (
      <div className="text-red-500 text-center mt-20">
        {error}
      </div>
    );
  }

  // Render dashboard only if auth passed
  return (
    <div className="flex flex-col min-h-screen bg-zinc-800">
      <Header />
      <main className="flex-grow">
        <FullDetailed />
      </main>
      <Footer />
    </div>
  );
}

export default Dashboard;
