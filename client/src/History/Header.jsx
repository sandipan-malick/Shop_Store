import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // Auth check on mount - redirect to login if unauthorized
  const checkAuth = async () => {
    try {
      // Replace with your real auth check endpoint
      await axios.get("https://shop-store-1-z2v0.onrender.com/history", { withCredentials: true });
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
      }
    }
  };
  function logout() {
    axios.post("https://shop-store-1-z2v0.onrender.com/api/item/logout", {}, { withCredentials: true })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.error("Logout error:", err);
        alert("Logout failed. Please try again.");
      });
  }

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Searching for: ${searchTerm}`);
    setSearchTerm("");
    setSearchOpen(false);
  };

  return (
    <nav className="text-white bg-zinc-900">
      <div className="container flex items-center justify-between p-2 mx-auto">

        {/* Mobile: Hamburger */}
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop: Nav buttons */}
        <div className="hidden space-x-3 md:flex">
          <Link to="/dashboard">
            <button
              className={`flex items-center space-x-1 btn ${isActive("/dashboard")
                ? "bg-blue-700 text-white"
                : "btn-outline-primary"
                }`}
            >
              <i className="bi bi-house-door-fill"></i>
              <span>Home</span>
            </button>
          </Link>

          <Link to="/item">
            <button className="flex items-center space-x-1 btn btn-outline-primary">
              <i className="bi bi-diagram-3-fill"></i>
              <span>Item</span>
            </button>
          </Link>

          <Link to="/history">
            <button
              className={`flex items-center space-x-1 btn ${isActive("/history")
                ? "bg-yellow-700 text-white"
                : "btn-outline-primary"
                }`}
            >
              <i className="bi bi-hourglass-bottom"></i>
              <span>History</span>
            </button>
          </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-1 btn btn-outline-danger"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile: Page Title */}
        <h1 className="text-lg font-semibold text-yellow-600 md:hidden">History</h1>
      </div>

      {/* Mobile: Search form */}
      {searchOpen && (
        <div className="px-4 pb-4 md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex">
            <input
              type="search"
              className="flex-grow px-3 py-2 text-white border border-gray-600 rounded-md outline-none bg-zinc-800"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search"
            />
            <button
              type="submit"
              className="px-4 ml-2 text-white bg-blue-600 rounded-md outline-none hover:bg-blue-700"
            >
              <i className="bi bi-search"></i>
            </button>
          </form>
        </div>
      )}

      {/* Mobile: Menu */}
      {menuOpen && (
        <div className="px-4 pb-4 space-y-2 md:hidden">
          <Link
            to="/dashboard"
            className="block px-3 py-2 text-left text-blue-600 rounded btn btn-outline-primary"
            onClick={() => setMenuOpen(false)}
          >
            <button>
              <i className="bi bi-house-door-fill"></i> <span>Home</span>
            </button>
          </Link>
          <Link
            to="/item"
            className="block px-3 py-2 text-left text-blue-600 rounded btn btn-outline-primary"
            onClick={() => setMenuOpen(false)}
          >
            <button>
              <i className="bi bi-diagram-3-fill"></i>  <span>Item</span>
            </button>
          </Link>
          <Link
            to="/history"
            className={`block text-left px-3 py-2 text-yellow-600 rounded btn btn-outline-warning
              ${isActive("/history")
                ? "bg-yellow-700 text-white"
                : "btn-outline-primary"
              }`}
            onClick={() => setMenuOpen(false)}
          >
            <i className="bi bi-hourglass-bottom"></i> <span>History</span>
          </Link>
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="block w-full px-3 py-2 text-left text-red-600 rounded btn btn-outline-danger"
          >
            <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}

export default Header;
