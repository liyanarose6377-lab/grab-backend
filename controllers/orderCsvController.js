const csv = require("csvtojson");
const Order = require("../models/Order");

exports.uploadCsvController = async (req, res) => {
  try {
    const { invitationCode } = req.body;
    if (!invitationCode) return res.status(400).json({ message: "Invitation code missing" });

    if (!req.file) return res.status(400).json({ message: "CSV file missing" });

    const jsonArray = await csv().fromFile(req.file.path);

    let index = 1;

    for (let row of jsonArray) {
      await Order.create({
        platform: row.platform,
        title: row.title,
        amount: row.amount,
        commission: row.commission,
        totalProfit: row.totalProfit,
        image: row.image || "",
        orderType: row.orderType || "single",
        images: row.images
        ? row.images.split(",").map(img =>
            img.trim().startsWith("http")
              ? img.trim()
              : `${req.protocol}://${req.get("host")}/uploads/orders/${img.trim()}`
          )
        : [],
      
        invitationCode,
        orderIndex: index++
      });
    }

    res.json({ success: true, message: "CSV uploaded successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "CSV upload failed" });
  }
};
