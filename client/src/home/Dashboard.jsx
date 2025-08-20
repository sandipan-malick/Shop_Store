import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import FullDetailed from "./FullDetailed";
import Footer from "./Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get(
          "https://shop-store-1-z2v0.onrender.com/",
          { withCredentials: true } // ✅ send cookies
        );
        if (!res.data.loggedIn) {
          navigate("/login");
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) return <div className="text-white">Loading...</div>;

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