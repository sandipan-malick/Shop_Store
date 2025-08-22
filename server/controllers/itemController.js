const mongoose = require("mongoose");
const Item = require("../models/Item");
const HistoryPage = require("../models/HistoryPage");
const UpdateItem = require("../models/UpdateItem");
const DashboardInvestment = require("../models/DashboardInvesment");

// ================== Add Item ==================
exports.addItem = async (req, res) => {
  const { productName, productPrice, productSellPrice, productDescription, quantity } = req.body;
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const existingProduct = await Item.findOne({ productName, userId });
    if (existingProduct) {
      return res.status(409).json({ error: "Product name already exists for this user" });
    }

    const product = await Item.create({
      productName,
      productPrice,
      productSellPrice,
      quantity,
      productDescription,
      userId,
    });

    const itemInvestment = productPrice * quantity;
    await DashboardInvestment.create({ userId, totalInvestment: itemInvestment });

    res.json({ message: "Product added successfully", product });
  } catch (err) {
    console.error("Add item error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== Search Item ==================
exports.search = async (req, res) => {
  try {
    const query = req.query.q?.trim().toLowerCase();
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!query) return res.status(400).json({ error: "Search term required" });

    const product = await Item.findOne({
      productName: new RegExp(`^${query}$`, "i"),
      userId,
    });

    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== Update Item ==================
exports.updateItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const updateFields = {};
  const { quantity, productPrice, productSellPrice, productDescription } = req.body;

  try {
    const item = await Item.findOne({ _id: id, userId });
    if (!item) {
      return res.status(404).json({ error: "Item not found or you don't have permission" });
    }

    if (quantity !== undefined) {
      if (typeof quantity !== "number" || quantity < 0) {
        return res.status(400).json({ error: "Quantity must be a positive number" });
      }
      updateFields.quantity = item.quantity + quantity;
    }

    if (productPrice !== undefined) {
      if (typeof productPrice !== "number" || productPrice < 0) {
        return res.status(400).json({ error: "Product Price must be a positive number" });
      }
      updateFields.productPrice = productPrice;
    }

    if (productSellPrice !== undefined) {
      if (typeof productSellPrice !== "number" || productSellPrice < 0) {
        return res.status(400).json({ error: "Selling Price must be a positive number" });
      }
      updateFields.productSellPrice = productSellPrice;
    }

    if (productDescription !== undefined) {
      updateFields.productDescription = productDescription;
    }

    const updatedItem = await Item.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true }
    );

    await UpdateItem.create({
      productName: updatedItem.productName,
      productPrice: updatedItem.productPrice,
      sellPrice: updatedItem.productSellPrice,
      quantityChanged: quantity || 0,
      userId,
    });

    res.json({ message: "Item updated successfully and update history recorded", item: updatedItem });
  } catch (err) {
    console.error("Update item error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== Decrease Quantity & Save History ==================
exports.update = async (req, res) => {
  const { decreaseAmount } = req.body;
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  if (!decreaseAmount || decreaseAmount <= 0) {
    return res.status(400).json({ error: "Decrease amount must be greater than 0" });
  }

  try {
    const item = await Item.findOne({ _id: req.params.id, userId });
    if (!item) {
      return res.status(404).json({ error: "Product not found" });
    }
    if (typeof item.quantity !== "number") {
      return res.status(400).json({ error: "Invalid item quantity" });
    }
    if (item.quantity < decreaseAmount) {
      return res.status(400).json({ error: "Not enough stock to decrease" });
    }

    item.quantity -= decreaseAmount;
    await item.save();

    await HistoryPage.create({
      productName: item.productName,
      productPrice: item.productPrice,
      sellPrice: item.productSellPrice,
      quantityChanged: -decreaseAmount,
      userId,
    });

    res.json({ message: "Quantity decreased & history recorded", item });
  } catch (error) {
    console.error("Error in decreaseQuantity:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== Delete Item ==================
exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const deletedItem = await Item.findOneAndDelete({ _id: id, userId });
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found or you don't have permission" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Delete item error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== History ==================
exports.history = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const updates = await UpdateItem.find({ userId }).lean();
    const sales = await HistoryPage.find({ userId }).lean();

    const allHistory = [...updates, ...sales];
    allHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Format response: add date & time from createdAt
    const formattedHistory = allHistory.map(h => ({
      ...h,
      date: new Date(h.createdAt).toLocaleDateString("en-CA"),
      time: new Date(h.createdAt).toLocaleTimeString("en-GB", { hour12: false }),
    }));

    res.json(formattedHistory);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== Get Total Investment ==================
exports.getTotalInvestment = async (req, res) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const dashboards = await DashboardInvestment.find({ userId });
    if (!dashboards || dashboards.length === 0) {
      return res.status(404).json({ error: "Dashboard not found" });
    }

    // Total Investment
    const totalDashboardInvestment = dashboards
      .map(doc => doc.totalInvestment || 0)
      .reduce((a, b) => a + b, 0);

    const updateItems = await UpdateItem.find({ userId });
    const totalUploadsInvestment = updateItems
      .map(item => (item.productPrice || 0) * (item.quantityChanged || 0))
      .reduce((a, b) => a + b, 0);

    const combinedTotalInvestment = totalDashboardInvestment + totalUploadsInvestment;

    // All-time sales
    const sales = await HistoryPage.find({ userId }).lean();

    // ✅ Today’s sales only
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaySales = await HistoryPage.find({
      userId,
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    });

    const dailySales = todaySales.reduce(
      (acc, sale) => acc + sale.sellPrice * Math.abs(sale.quantityChanged),
      0
    );

    // All-time totals
    const totalSales = sales.reduce(
      (acc, sale) => acc + sale.sellPrice * Math.abs(sale.quantityChanged),
      0
    );

    const totalCost = sales.reduce(
      (acc, sale) => acc + sale.productPrice * Math.abs(sale.quantityChanged),
      0
    );

    const totalProfit = totalSales - totalCost;

    // Format today’s date
    const todayDate = new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

    res.json({
      totalDashboardInvestment,
      totalUploadsInvestment,
      combinedTotalInvestment,
      dailySales,
      totalSales,
      totalProfit,
      todayDate,
    });
  } catch (err) {
    console.error("Error calculating dashboard stats:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ================== Logout ==================
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          console.error("Session destroy error:", err);
          return res.status(500).json({ error: "Logout failed" });
        }
        return res.json({ message: "Logged out successfully" });
      });
    } else {
      res.json({ message: "Logged out successfully" });
    }
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Server error during logout" });
  }
};
