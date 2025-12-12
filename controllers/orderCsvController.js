const csv = require("csvtojson");
const Order = require("../models/Order");

exports.uploadCsvController = async (req, res) => {
  try {
    const { invitationCode } = req.body;

    if (!invitationCode) {
      return res.status(400).json({ success: false, message: "Invitation code missing" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "CSV file missing" });
    }

    // Convert CSV → JSON
    const jsonArray = await csv().fromFile(req.file.path);

    if (!jsonArray.length) {
      return res.status(400).json({ success: false, message: "CSV file is empty" });
    }

    // PLATFORM from first row
    const platform = jsonArray[0].platform;

    // ⭐ GET LAST ORDER INDEX FOR THIS INVITATION CODE + PLATFORM
    const lastOrder = await Order.findOne({ platform, invitationCode })
      .sort({ orderIndex: -1 });

    let index = lastOrder ? lastOrder.orderIndex + 1 : 1;

    // PROCESS ALL ROWS SAFELY
    for (let row of jsonArray) {
      // ---------- FIX: CLEAN IMAGE ----------
      const singleImage = row.image && row.image.trim() !== "" ? row.image.trim() : "";

      const fixedSingleImage =
        singleImage.startsWith("http")
          ? singleImage
          : singleImage !== ""
          ? `${req.protocol}://${req.get("host")}/uploads/orders/${singleImage}`
          : "";

      // ---------- FIX: CLEAN COMBINE IMAGES ----------
      let imagesArray = [];

      if (row.images) {
        imagesArray = row.images
          .split(",")
          .map((img) => img.trim())
          .filter((img) => img !== "") // remove empty values
          .map((img) =>
            img.startsWith("http")
              ? img
              : `${req.protocol}://${req.get("host")}/uploads/orders/${img}`
          );
      }

      // CREATE ORDER IN DB
      await Order.create({
        platform: row.platform,
        title: row.title,
        amount: Number(row.amount),
        commission: Number(row.commission || 0),
        totalProfit: Number(row.totalProfit || 0),
        orderType: row.orderType || "single",

        image: row.orderType === "single" ? fixedSingleImage : "",
        images: row.orderType === "combine" ? imagesArray : [],

        invitationCode,
        orderIndex: index++,
        status: "active",
      });
    }

    return res.json({
      success: true,
      message: "CSV uploaded successfully (sequence fixed, images fixed)",
    });

  } catch (err) {
    console.log("CSV Upload Error:", err);
    return res.status(500).json({ success: false, message: "CSV upload failed" });
  }
};
