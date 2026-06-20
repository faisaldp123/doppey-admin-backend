import axios from "axios";
import Order from "../models/Order.js";

export const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (!order.waybill) {
      return res.status(400).json({
        message: "Tracking not generated yet",
      });
    }

    const response = await axios.get(
      `https://track.delhivery.com/api/v1/packages/json/?waybill=${order.waybill}`,
      {
        headers: {
          Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};