import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPopup, setSearchPopup] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const [decreaseForItem, setDecreaseForItem] = useState(null);
  const [decreaseValue, setDecreaseValue] = useState(1);

  const [updateForItem, setUpdateForItem] = useState(null);
  const [updateQuantityValue, setUpdateQuantityValue] = useState(0);
  const [updatePriceValue, setUpdatePriceValue] = useState("");

  // EDIT SELL PRICE ONLY
  const [editSellPriceForItem, setEditSellPriceForItem] = useState(null);
  const [editSellPriceValue, setEditSellPriceValue] = useState("");

  const [form, setForm] = useState({
    productName: "",
    productPrice: "",
    productSellPrice: "",
    quantity: 0,
    productDescription: "",
  });

  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "quantity" ? Number(value) : value,
    });
  };

  // Add product
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://shop-store-1-z2v0.onrender.com/api/item/add-item", form, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      alert("Product added successfully!");
      setShowAddPopup(false);
      setForm({
        productName: "",
        productPrice: "",
        productSellPrice: "",
        quantity: 0,
        productDescription: "",
      });
    } catch (error) {
      console.error(error);
      alert("Error adding product");
    }
  };

  // Search product by name
  const handleSearchClick = async () => {
    if (!searchTerm.trim()) {
      alert("Please enter a product name");
      return;
    }
    try {
      const res = await axios.get(
        `https://shop-store-1-z2v0.onrender.com/api/item/search?q=${encodeURIComponent(searchTerm.trim())}`,
        { withCredentials: true }
      );
      const data = res.data ? [res.data] : [];
      setSearchResults(data);
      setSearchPopup(true);
      setDecreaseForItem(null);
      setUpdateForItem(null);
      setEditSellPriceForItem(null);
    } catch (error) {
      setSearchResults([]);
      setSearchPopup(true);
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`https://shop-store-1-z2v0.onrender.com/api/item/${id}/delete`, {
        withCredentials: true,
      });
      setSearchResults((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error(error);
      alert("Failed to delete product");
    }
  };

  // Open decrease quantity input
  const openDecreaseInput = (id) => {
    setUpdateForItem(null);
    setEditSellPriceForItem(null);
    setDecreaseForItem(id);
    setDecreaseValue(1);
  };

  // Apply decrease quantity
  const applyDecrease = async (id, currentQuantity) => {
    const amt = Number(decreaseValue);
    if (!amt || amt <= 0) {
      alert("Enter a positive number to decrease.");
      return;
    }
    if (amt > currentQuantity) {
      alert("Cannot decrease more than the current quantity.");
      return;
    }
    try {
      const res = await axios.put(
        `https://shop-store-1-z2v0.onrender.com/api/item/${id}/decrease`,
        { decreaseAmount: amt },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      setSearchResults((prev) =>
        prev.map((item) => (item._id === id ? res.data.item : item))
      );
      setDecreaseForItem(null);
    } catch (error) {
      console.error(error);
      alert("Failed to apply decrease: " + (error.response?.data?.error || error.message));
    }
  };

  function logout() {
    axios
      .post("https://shop-store-1-z2v0.onrender.com/api/item/logout", {}, { withCredentials: true })
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        console.error("Logout error:", err);
        alert("Logout failed. Please try again.");
      });
  }

  // Open update quantity and price input
  const openUpdateQuantityInput = (id, currentQuantity, currentPrice) => {
    setDecreaseForItem(null);
    setEditSellPriceForItem(null);
    setUpdateForItem(id);
    setUpdateQuantityValue(0);
    setUpdatePriceValue(currentPrice !== undefined ? currentPrice : "");
  };

  // Apply update quantity (add) and price
  const applyUpdateQuantityAndPrice = async (id) => {
    const addQty = Number(updateQuantityValue);
    const newPrice = Number(updatePriceValue);
    if (isNaN(addQty) || addQty < 0) {
      alert("Enter a valid quantity (0 or more)");
      return;
    }
    if (isNaN(newPrice) || newPrice < 0) {
      alert("Enter a valid price (0 or more)");
      return;
    }
    try {
      const payload = { quantity: addQty, productPrice: newPrice };
      const res = await axios.put(
        `https://shop-store-1-z2v0.onrender.com/api/item/${id}`,
        payload,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      setSearchResults((prev) =>
        prev.map((item) => (item._id === id ? res.data.item : item))
      );
      setUpdateForItem(null);
      setUpdateQuantityValue(0);
      setUpdatePriceValue("");
    } catch (error) {
      console.error(error);
      alert("Failed to update quantity and price");
    }
  };

  // EDIT SELL PRICE ONLY
  const openEditSellPriceInput = (id, currentSellPrice) => {
    setDecreaseForItem(null);
    setUpdateForItem(null);
    setEditSellPriceForItem(id);
    setEditSellPriceValue(currentSellPrice !== undefined ? currentSellPrice : "");
  };

  const applyEditSellPrice = async (id) => {
    const newSell = Number(editSellPriceValue);
    if (isNaN(newSell) || newSell < 0) {
      alert("Enter a valid sell price (0 or more)");
      return;
    }
    try {
      const payload = { productSellPrice: newSell };
      const res = await axios.put(
        `https://shop-store-1-z2v0.onrender.com/api/item/${id}`,
        payload,
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );
      setSearchResults((prev) =>
        prev.map((item) => (item._id === id ? res.data.item : item))
      );
      setEditSellPriceForItem(null);
      setEditSellPriceValue("");
    } catch (error) {
      console.error(error);
      alert("Failed to update selling price");
    }
  };

  // Auth check on mount


  return (
    <>
      <nav className="text-white shadow-md bg-zinc-900">
        <div className="container flex flex-wrap items-center justify-between p-3 mx-auto">
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
          <h1 className="text-lg font-semibold text-blue-600 md:hidden">Item</h1>
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
          <div className={`w-full md:w-auto md:flex md:items-center gap-3 ${menuOpen ? "block" : "hidden"}`}>
            <div className="flex flex-col gap-2 mt-3 md:flex-row md:mt-0">
              <Link to="/" className="flex items-center space-x-1 btn btn-outline-primary">
                <button>
                  <i className="bi bi-house-door-fill"></i> <span>Home</span>
                </button>
              </Link>
              <Link to="/item" className={`flex items-center space-x-1 btn btn-outline-primary ${isActive("/item") ? "bg-blue-700 text-white" : "btn-outline-primary"}`}>
                <button> <i className="bi bi-diagram-3-fill"></i> <span>Item</span>
                </button>
              </Link>
              <Link to="/history" className="flex items-center space-x-1 btn btn-outline-warning">
                <button>
                  <i className="bi bi-hourglass-bottom"></i> <span>History</span>
                </button>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-1 btn btn-outline-danger"
              >
                <i className="bi bi-box-arrow-right"></i> <span>Logout</span>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-3 md:hidden">
              <input
                type="search"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 text-white border border-gray-600 rounded outline-none bg-zinc-800"
              />
              <button onClick={handleSearchClick} className="px-3 py-2 text-white bg-blue-600 rounded">
                <i className="text-xl bi bi-search"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Results Popup */}
      {searchPopup && (
        <div className="fixed inset-0 flex items-center justify-center p-2 bg-black bg-opacity-40">
          <div className="w-full max-w-lg p-4 bg-white text-black rounded shadow-lg overflow-y-auto max-h-[80vh]">
            <h2 className="mb-3 text-lg font-bold">Search Results</h2>
            {searchResults.length > 0 ? (
              <ul className="space-y-3">
                {searchResults.map((item) => (
                  <li
                    key={item._id}
                    className={`p-3 rounded ${item.quantity >= 1 ? "bg-green-200" : "bg-red-200"}`}
                  >
                    <h3 className="font-bold">{item.productName}</h3>
                    <p>Price: {item.productPrice}</p>
                    <p>Sell Price: {item.productSellPrice}</p>
                    <p>Quantity: {item.quantity}</p>
                    {item.productDescription && <p>Description: {item.productDescription}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="px-3 py-1 text-white bg-red-600 rounded outline-none"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => openDecreaseInput(item._id)}
                        className="px-3 py-1 text-white bg-yellow-600 rounded outline-none"
                      >
                        - Qty
                      </button>
                      <button
                        onClick={() => openUpdateQuantityInput(item._id, item.quantity, item.productPrice)}
                        className="px-3 py-1 text-white bg-blue-600 rounded outline-none"
                      >
                        Update Qty & Price
                      </button>
                      {/* EDIT SELL PRICE BUTTON */}
                      <button
                        onClick={() => openEditSellPriceInput(item._id, item.productSellPrice)}
                        className="px-3 py-1 text-white rounded outline-none bg-cyan-600"
                      >
                        Edit Sell Price
                      </button>
                    </div>

                    {/* Decrease quantity editor */}
                    {decreaseForItem === item._id && (
                      <div className="w-full p-3 mt-3 bg-yellow-100 border border-yellow-300 rounded outline-none">
                    
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max={item.quantity}
                            value={decreaseValue}
                            onChange={(e) =>
                              setDecreaseValue(Math.max(0, Number(e.target.value || 0)))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                applyDecrease(item._id, item.quantity);
                              }
                            }}
                            className="w-24 px-2 py-1 border rounded outline-none"
                          />
                       
                     
                        </div>
                      </div>
                    )}

                    {/* Update to inline editor (quantity & price) */}
                    {updateForItem === item._id && (
                      <div className="w-full p-3 mt-3 bg-blue-100 border border-blue-300 rounded">
                        <label className="block mb-1 text-sm font-semibold text-blue-900">
                          Add quantity (increment)
                        </label>
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="number"
                            min="0"
                            value={updateQuantityValue}
                            onChange={(e) => setUpdateQuantityValue(Number(e.target.value))}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                applyUpdateQuantityAndPrice(item._id);
                              }
                            }}
                            className="w-24 px-2 py-1 border rounded outline-none"
                            placeholder="Quantity to add"
                          />
                          <button
                            onClick={() => applyUpdateQuantityAndPrice(item._id)}
                            className="px-3 py-1 text-white bg-blue-600 rounded"
                          >
                            Apply
                          </button>
                        </div>
                        <label className="block mb-1 text-sm font-semibold text-blue-900">
                          Set new price
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={updatePriceValue}
                            onChange={(e) => setUpdatePriceValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                applyUpdateQuantityAndPrice(item._id);
                              }
                            }}
                            className="w-24 px-2 py-1 border rounded outline-none"
                            placeholder="Price"
                          />
                    
                     
                        </div>
                      </div>
                    )}

                    {/* EDIT SELL PRICE ONLY */}
                    {editSellPriceForItem === item._id && (
                      <div className="w-full p-3 mt-3 border rounded bg-cyan-100 border-cyan-300">
                        <label className="block mb-1 text-sm font-semibold text-cyan-900">
                          Set new selling price
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={editSellPriceValue}
                            onChange={(e) => setEditSellPriceValue(e.target.value)}
                            className="w-24 px-2 py-1 border rounded outline-none"
                            placeholder="Sell Price"
                          />
                          <button
                            onClick={() => applyEditSellPrice(item._id)}
                            className="px-3 py-1 text-white rounded bg-cyan-600"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => setEditSellPriceForItem(null)}
                            className="px-3 py-1 rounded text-cyan-900 bg-cyan-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-red-500">No product found</p>
            )}
            <div className="flex justify-end mt-4">
       
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
