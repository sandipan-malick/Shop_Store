// models/DashboardInvestment.js
const mongoose = require("mongoose");

const DashboardInvestmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", required: true
    },
    totalInvestment: { type: Number, default: 0 },
});

module.exports = mongoose.model("DashboardInvestment", DashboardInvestmentSchema);
