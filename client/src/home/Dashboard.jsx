import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "./Header";
import FullDetailed from "./FullDetailed";
import Footer from "./Footer";

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);


const checkAuth = async () => {
  try {
    await axios.get("https://shop-store-1-z2v0.onrender.com/dashboard", { withCredentials: true });
    setLoading(false); // auth passed, show dashboard
  } catch (err) {
    if (err.response && err.response.status === 401) {
      navigate("/login");
    } else {
      console.error(err);
    }
  }
};


  // Run auth check once when component mounts
  useEffect(() => {
    checkAuth();
  }, []);

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