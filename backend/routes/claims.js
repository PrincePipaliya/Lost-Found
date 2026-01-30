const router = require("express").Router();
const Claim = require("../models/Claim");
const Item = require("../models/Item");
const auth = require("../middleware/auth");

/* SUBMIT CLAIM */
router.post("/:itemId", auth, async (req, res) => {
  const item = await Item.findById(req.params.itemId);

  if (!item || item.claimed) {
    return res.status(400).json({ message: "Item not available" });
  }

  if (item.userId.toString() === req.user.id) {
    return res.status(403).json({ message: "You cannot claim your own item" });
  }

  const existing = await Claim.findOne({
    itemId: item._id,
    claimantId: req.user.id
  });

  if (existing) {
    return res.status(400).json({ message: "Already claimed" });
  }

  const claim = await Claim.create({
    itemId: item._id,
    claimantId: req.user.id,
    answers: req.body.answers
  });

  res.json(claim);
});

/* VIEW CLAIMS (ITEM OWNER) */
router.get("/item/:itemId", auth, async (req, res) => {
  const item = await Item.findById(req.params.itemId);

  if (!item || item.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  const claims = await Claim.find({ itemId: item._id })
    .populate("claimantId", "name email");

  res.json(claims);
});

/* APPROVE CLAIM */
router.put("/:id/approve", auth, async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  const item = await Item.findById(claim.itemId);

  if (item.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  claim.status = "approved";
  await claim.save();

  item.claimed = true;
  await item.save();

  await Claim.updateMany(
    { itemId: item._id, _id: { $ne: claim._id } },
    { status: "rejected" }
  );

  res.json({ message: "Claim approved" });
});

/* REJECT CLAIM */
router.put("/:id/reject", auth, async (req, res) => {
  await Claim.findByIdAndUpdate(req.params.id, {
    status: "rejected"
  });

  res.json({ message: "Claim rejected" });
});

module.exports = router;
