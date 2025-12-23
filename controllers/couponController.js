import Coupon from "../models/Coupon.js";

/* ================= CREATE COUPON ================= */
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= GET ALL COUPONS ================= */
export const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
};

/* ================= UPDATE COUPON ================= */
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= DELETE COUPON ================= */
export const deleteCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return res.status(404).json({ message: "Coupon not found" });
  }

  res.json({ message: "Coupon deleted" });
};

/* ================= APPLY COUPON (USER SIDE) ================= */
export const applyCoupon = async (req, res) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon)
    return res.status(400).json({ message: "Invalid coupon" });

  if (coupon.expiryDate < new Date())
    return res.status(400).json({ message: "Coupon expired" });

  if (coupon.usedCount >= coupon.usageLimit)
    return res.status(400).json({ message: "Coupon usage limit exceeded" });

  if (orderAmount < coupon.minOrderValue)
    return res
      .status(400)
      .json({ message: "Order amount too low" });

  let discount =
    coupon.discountType === "PERCENT"
      ? (orderAmount * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  res.json({
    discount,
    finalAmount: orderAmount - discount,
  });
};
