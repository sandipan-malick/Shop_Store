const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const itemController = require("../controllers/itemController");

//
router.get("/add-invesment", authMiddleware, itemController.getTotalInvestment);
// Add new product
router.post("/add-item", authMiddleware, itemController.addItem);

// Search product by name
router.get("/search", authMiddleware, itemController.search);

// Get all items
router.get("/history", authMiddleware, itemController.history);

// Update product (including quantity addition)
router.put("/:id", authMiddleware, itemController.updateItem);

// Decrease quantity
router.put("/:id/decrease", authMiddleware, itemController.update);

// Delete product
router.delete("/:id/delete", authMiddleware, itemController.deleteItem);
// Logout
router.post("/logout", authMiddleware, itemController.logout);

module.exports = router;
