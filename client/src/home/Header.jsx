import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPopup, setSearchPopup] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  // 🔎 Handle search
  const handleSearchClick = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a product name");
      return;
    }
    try {
      const res = await axios.get(
        `https://shop-store-1-z2v0.onrender.com/api/item/search?q=${encodeURIComponent(
          searchTerm.trim()
        )}`,
        { withCredentials: true }
      );
      const data = res.data ? [res.data] : [];
      setSearchResults(data);
      setSearchPopup(true);
    } catch (error) {
      setSearchResults([]);
      setSearchPopup(true);
    }
  };

  // 🚪 Logout
  function logout() {
    axios
      .post(
        "https://shop-store-1-z2v0.onrender.com/api/item/logout",
        {},
        { withCredentials: true }
      )
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.error("Logout error:", err);
        alert("Logout failed. Please try again.");
      });
  }

  return (
    <>
      {/* Navbar */}
      <nav className="text-white shadow-md bg-zinc-900">
        <div className="container flex flex-wrap items-center justify-between p-3 mx-auto">
          {/* Mobile toggle */}
          <button
            className="p-2 rounded md:hidden hover:bg-zinc-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* Logo */}
          <h1 className="text-lg font-semibold text-blue-600 md:hidden">
            Item
          </h1>

          {/* Desktop search */}
          <div className="items-center flex-1 hidden max-w-lg gap-2 mx-4 md:flex">
            <input
              type="search"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-white border border-gray-600 rounded outline-none bg-zinc-800"
            />
            <button
              onClick={handleSearchClick}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              <i className="text-xl bi bi-search"></i>
            </button>
          </div>

          {/* Menu links */}
          <div
            className={`w-full md:w-auto md:flex md:items-center gap-3 ${
              menuOpen ? "block" : "hidden"
            }`}
          >
            <div className="flex flex-col gap-2 mt-3 md:flex-row md:mt-0">
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 btn btn-outline-primary"
              >
                <button>
                  <i className="bi bi-house-door-fill"></i> <span>Home</span>
                </button>
              </Link>
              <Link
                to="/item"
                className={`flex items-center space-x-1 btn btn-outline-primary ${
                  isActive("/item") ? "bg-blue-700 text-white" : ""
                }`}
              >
                <button>
                  <i className="bi bi-diagram-3-fill"></i> <span>Item</span>
                </button>
              </Link>
              <Link
                to="/history"
                className="flex items-center space-x-1 btn btn-outline-warning"
              >
                <button>
                  <i className="bi bi-hourglass-bottom"></i>{" "}
                  <span>History</span>
                </button>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-1 btn btn-outline-danger"
              >
                <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
              </button>
            </div>

            {/* Mobile search */}
            <div className="flex items-center gap-2 mt-3 md:hidden">
              <input
                type="search"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 text-white border border-gray-600 rounded outline-none bg-zinc-800"
              />
              <button
                onClick={handleSearchClick}
                className="px-3 py-2 text-white bg-blue-600 rounded"
              >
                <i className="text-xl bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 🔎 Search Results Popup */}
      {searchPopup && (
        <div className="fixed inset-0 flex items-center justify-center p-2 bg-black bg-opacity-40">
          <div className="w-full max-w-lg p-4 bg-white text-black rounded shadow-lg overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold">Search Results</h2>
              <button
                onClick={() => setSearchPopup(false)}
                className="px-3 py-1 text-white bg-red-600 rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
            {searchResults.length > 0 ? (
              <ul className="space-y-3">
                {searchResults.map((item) => (
                  <li
                    key={item._id}
                    className={`p-3 rounded ${
                      item.quantity >= 1 ? "bg-green-200" : "bg-red-200"
                    }`}
                  >
                    <h3 className="font-bold">{item.productName}</h3>
                    <p>Price: {item.productPrice}</p>
                    <p>Sell Price: {item.productSellPrice}</p>
                    <p>Quantity: {item.quantity}</p>
                    {item.productDescription && (
                      <p>Description: {item.productDescription}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-500">No product found</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
