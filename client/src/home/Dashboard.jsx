import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import FullDetailed from "./FullDetailed";
import Footer from "./Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Check for auth cookie
  const checkAuthCookie = async () => {
    // Simple client-side check for a cookie (change "token" to your cookie name)
    const cookies = document.cookie.split(";").map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith("token="));

    if (!authCookie) {
      navigate("/login");
      return;
    }

    // If cookie exists, you can optionally verify it with the backend
    try {
      await axios.get("https://shop-store-1-z2v0.onrender.com/dashboard", {
        withCredentials: true,
      });
      setLoading(false); // auth passed, show dashboard
    } catch (err) {
      navigate("/login");
    }
  };

  useEffect(() => {
    checkAuthCookie();
  }, []);

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
