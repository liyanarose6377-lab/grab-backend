const path = require("path");
const Order = require("../models/Order");
const User = require("../models/User");

// Helper to create full file URL
const buildFileUrl = (req, filename) => {
    if (!filename) return "";
    return `${req.protocol}://${req.get("host")}/uploads/orders/${filename}`;
};

/* ======================================================================
   ADMIN: CREATE ORDER (SINGLE / COMBINE)
   → FIXED orderIndex (per user / per invitationCode)
====================================================================== */
exports.createOrder = async (req, res) => {
    try {
        const {
            platform,
            title,
            amount,
            commission,
            totalProfit,
            orderType,
            invitationCode,
        } = req.body;

        if (!platform || !title || !amount) {
            return res.status(400).json({
                success: false,
                message: "platform, title and amount required",
            });
        }

        // Invitation code must not be empty
        if (!invitationCode || invitationCode.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Invitation code is required"
            });
        }


        let image = "";
        let images = [];

        // SINGLE ORDER
        if (orderType === "single") {
            if (req.file) image = req.file.filename;
            else image = req.body.image || "";
        }

        // COMBINE ORDER
        if (orderType === "combine") {
            if (req.files && req.files.length > 0)
                images = req.files.map((f) => f.filename);
            else if (req.body.images)
                images = Array.isArray(req.body.images)
                    ? req.body.images
                    : [req.body.images];
        }

        /* ⭐ FIXED ORDER INDEX SYSTEM ⭐
           Each invitationCode has its own sequence.
           Orders for different users can NEVER mix up.
        */
        const indexQuery = {
            platform,
            invitationCode: invitationCode ? invitationCode.trim() : null

        };

        const lastOrder = await Order.findOne(indexQuery).sort({ orderIndex: -1 });
        const nextIndex = lastOrder ? lastOrder.orderIndex + 1 : 1;

        const order = await Order.create({
            platform,
            orderType,
            title,
            amount: Number(amount),
            commission: Number(commission || 0),
            totalProfit: Number(totalProfit || commission || 0),
            image,
            images,
            invitationCode: invitationCode || null,
            orderIndex: nextIndex,
            status: "active",
        });

        // Convert image path to full URL
        const result = order.toObject();
        if (result.image) result.image = buildFileUrl(req, result.image);
        if (result.images.length)
            result.images = result.images.map((f) => buildFileUrl(req, f));

        return res.json({ success: true, order: result });
    } catch (err) {
        console.error("createOrder error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ======================================================================
   GET ORDERS BY PLATFORM (FILTER FIXED)
   → Only public + user invitationCode orders
   → No mixed orders from other users
====================================================================== */
exports.getOrdersByPlatform = async (req, res) => {
    try {
        const platform = req.params.platform;
        const user = req.user;
        const userCode = user ? user.invitationCode : null;

        // Base query: Platform + active orders
        let query;

        if (userCode) {
            // Only this user's orders
            query = {
                platform,
                status: "active",
                invitationCode: userCode
            };
        } else {
            // Only public orders
            query = {
                platform,
                status: "active",
                invitationCode: null
            };
        }


        const orders = await Order.find(query).sort({ orderIndex: 1 }).lean();

        // Add URLs
        const mapped = orders.map((o) => {
            if (o.image) o.image = buildFileUrl(req, o.image);
            if (o.images?.length)
                o.images = o.images.map((f) => buildFileUrl(req, f));
            return o;
        });

        return res.json({
            success: true,
            orders: mapped.sort((a, b) => a.orderIndex - b.orderIndex)
        });

    } catch (err) {
        console.error("getOrdersByPlatform error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/* ======================================================================
   USER SUBMIT ORDER
====================================================================== */
exports.submitOrder = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId)
            return res
                .status(400)
                .json({ success: false, message: "orderId is required" });

        const order = await Order.findById(orderId);
        if (!order)
            return res
                .status(404)
                .json({ success: false, message: "Order not found" });

        if (order.user)
            return res
                .status(400)
                .json({ success: false, message: "Order already completed" });

        const user = await User.findById(req.user.id);
        if (!user)
            return res
                .status(404)
                .json({ success: false, message: "User not found" });

        // InvitationCode check
        if (order.invitationCode && order.invitationCode !== user.invitationCode) {
            return res.status(403).json({
                success: false,
                message: "This order is not for your invite code",
            });
        }

        // Balance check
        if (user.balance < order.amount) {
            return res
                .status(400)
                .json({ success: false, message: "Insufficient balance" });
        }

        // Mark order completed
        order.user = user._id;
        order.status = "archived";
        await order.save();

        // ⭐ DELETE archived orders (IMPORTANT)
        await Order.deleteMany({
            platform: order.platform,
            status: "archived",
            invitationCode: order.invitationCode || null
        });

        // Add commission
        const commissionToAdd = Number(order.commission || 0);

        user.balance += commissionToAdd;
        user.totalBalance = (user.totalBalance || 0) + commissionToAdd;
        user.totalOrders = (user.totalOrders || 0) + 1;
        user.todayProfit = (user.todayProfit || 0) + commissionToAdd;

        await user.save();


        return res.json({
            success: true,
            message: "Order submitted",
            user: {
                id: user._id,
                balance: user.balance,
                totalBalance: user.totalBalance,
                totalOrders: user.totalOrders,
            },
        });
    } catch (err) {
        console.error("submitOrder error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
