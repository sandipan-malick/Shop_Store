// Header.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Check if current path matches for active styling
  const isActive = (path) => location.pathname === path;

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    alert(`Searching for: ${searchTerm}`);
    setSearchTerm("");
    setSearchOpen(false);
  };

  // Navigate to dashboard (home page)
  const goHome = () => {
    navigate("/dashboard");
    setMenuOpen(false);
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop: Search form */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-grow hidden max-w-lg mx-4 md:flex"
          role="search"
        >
          <input
            type="search"
            className="flex-grow px-3 py-2 border border-gray-600 rounded-md outline-none bg-zinc-800"
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

        {/* Desktop: Nav buttons */}
        <div className="hidden space-x-3 md:flex">
          <button
            onClick={goHome}
            className={`flex items-center space-x-1 btn ${
              isActive("/") ? "bg-blue-700 text-white" : "btn-outline-primary"
            }`}
          >
            <i className="bi bi-house-door-fill"></i>
            <span>Home</span>
          </button>
          <Link to="/item">
            <button className="flex items-center space-x-1 btn btn-outline-primary">
              <i className="bi bi-diagram-3-fill"></i>
              <span>Item</span>
            </button>
          </Link>
          <Link to="/history">
            <button className="flex items-center space-x-1 btn btn-outline-warning">
              <i className="bi bi-hourglass-bottom"></i>
              <span>History</span>
            </button>
          </Link>
          <Link to="/logout">
            <button className="flex items-center space-x-1 btn btn-outline-danger">
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </Link>
        </div>

        {/* Mobile: Search icon */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="p-2 rounded md:hidden hover:bg-zinc-700"
          aria-label="Toggle search"
        >
          <i className="text-xl bi bi-search"></i>
        </button>
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
          <button
            onClick={goHome}
            className="block w-full px-3 py-2 text-left text-blue-600 rounded hover:bg-zinc-700"
          >
            Home
          </button>
          <Link
            to="/item"
            className="block px-3 py-2 text-blue-600 rounded hover:bg-zinc-700"
            onClick={() => setMenuOpen(false)}
          >
            Item
          </Link>
          <Link
            to="/history"
            className="block px-3 py-2 text-yellow-600 rounded hover:bg-zinc-700"
            onClick={() => setMenuOpen(false)}
          >
            History
          </Link>
          <Link
            to="/logout"
            className="block px-3 py-2 text-red-600 rounded hover:bg-zinc-700"
            onClick={() => setMenuOpen(false)}
          >
            Logout
          </Link>
        </div>
      )}
    </nav>
  );
}

export default Header;
