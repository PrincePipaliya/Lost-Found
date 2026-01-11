
const router = require("express").Router();
const Item = require("../models/Item");

router.post("/", async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.json(item);
});

router.get("/", async (req, res) => {
  const items = await Item.find().sort({ date: -1 });
  res.json(items);
});

module.exports = router;
