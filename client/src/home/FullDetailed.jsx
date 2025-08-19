import React, { useEffect, useState } from "react";
import axios from "axios";

function FullDetailed() {
  const [stats, setStats] = useState({
    combinedTotalInvestment: 0,
    dailySales: 0,
    totalSales: 0,
    totalProfit: 0,
  });

  useEffect(() => {
    axios
      .get("http://localhost:5080/api/item/add-insvement", { withCredentials: true })
      .then((res) => {
        setStats({
          combinedTotalInvestment: res.data.combinedTotalInvestment,
          dailySales: res.data.dailySales,
          totalSales: res.data.totalSales,
          totalProfit: res.data.totalProfit,
        });
      })
      .catch((err) => console.error("Error fetching investment:", err));
  }, []);

  return (
    <div className="w-full p-6 bg-zinc-800">
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Investment */}
        <div className="p-6 text-white transition bg-blue-600 rounded-lg shadow-md hover:shadow-lg">
          <h2 className="text-lg font-semibold">Total Investment</h2>
          <p className="mt-2 text-2xl font-bold">₹{stats.combinedTotalInvestment.toFixed(2)}</p>
        </div>

        {/* Daily Sales */}
        <div className="p-6 text-white transition bg-green-600 rounded-lg shadow-md hover:shadow-lg">
          <h2 className="text-lg font-semibold">Daily Sales</h2>
          <p className="mt-2 text-2xl font-bold">₹{stats.dailySales.toFixed(2)}</p>
        </div>

        {/* Total Sales */}
        <div className="p-6 text-white transition bg-yellow-500 rounded-lg shadow-md hover:shadow-lg">
          <h2 className="text-lg font-semibold">Total Sales</h2>
          <p className="mt-2 text-2xl font-bold">₹{stats.totalSales.toFixed(2)}</p>
        </div>

        {/* Total Profit */}
        <div className="p-6 text-white transition bg-red-500 rounded-lg shadow-md hover:shadow-lg">
          <h2 className="text-lg font-semibold">Total Profit</h2>
          <p className="mt-2 text-2xl font-bold">₹{stats.totalProfit.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

export default FullDetailed;
