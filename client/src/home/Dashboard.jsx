import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import FullDetailed from "./FullDetailed";
import Footer from "./Footer";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token"); // Or get it from context/state
    if (!token) {
      navigate("/login"); // Redirect if not logged in
    }
  }, [navigate]);

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
