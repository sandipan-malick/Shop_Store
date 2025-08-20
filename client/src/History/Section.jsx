import React, { useEffect, useState } from "react";
import axios from "axios";

const Section = () => {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    axios
      .get("https://shop-store-1-z2v0.onrender.com/api/item/history", { withCredentials: true })
      .then((res) => setHistoryData(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="w-full p-6 bg-gradient-to-br bg-zinc-800">
      <h1 className="mb-8 text-3xl font-bold text-center text-white">
        📊 Sales History
      </h1>

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto bg-white shadow-lg rounded-2xl md:block">
        <table className="w-full border-collapse table-auto">
          <thead>
            <tr className="text-sm text-gray-600 uppercase bg-gray-100">
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Time</th>
              <th className="p-4 text-left">Product</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Sell Price</th>
              <th className="p-4 text-left">Quantity</th>
            </tr>
          </thead>
          <tbody>
            {historyData.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="p-6 text-center text-gray-500"
                >
                  No sales history available
                </td>
              </tr>
            ) : (
              historyData.map((item, idx) => (
                <tr
                  key={item._id}
                  className={`transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100`}
                >
                  <td className="p-4 text-black">{item.date}</td>
                  <td className="p-4 text-black">{item.time}</td>
                  <td className="p-4 font-medium text-gray-800">
                    {item.productName}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full">
                      ₹ {item.productPrice}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full">
                      ₹ {item.sellPrice}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-sm font-semibold rounded-full ${
                        item.quantityChanged > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.quantityChanged}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 md:hidden">
        {historyData.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white shadow-md rounded-xl">
            No sales history available
          </div>
        ) : (
          historyData.map((item) => (
            <div
              key={item._id}
              className="p-5 transition bg-white shadow-md rounded-xl hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-2 text-sm text-gray-500">
                <span>{item.date}</span>
                <span>{item.time}</span>
              </div>
              <h2 className="mb-3 text-lg font-bold text-gray-800">
                {item.productName}
              </h2>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold text-green-700">
                    ₹ {item.productPrice}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Sell Price</span>
                  <span className="font-semibold text-blue-700">
                    ₹ {item.sellPrice}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-500">Quantity</span>
                  <span
                    className={`font-semibold ${
                      item.quantityChanged > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {item.quantityChanged}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Section;
