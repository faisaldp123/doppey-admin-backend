import axios from "axios";
import Order from "../models/Order.js";

async function getBlueDartToken() {
  const response = await axios.get(
    "https://apigateway.bluedart.com/in/transportation/token/v1/login",
    {
      auth: {
        username: process.env.BLUEDART_LOGIN_ID,
        password: process.env.BLUEDART_LICENSE_KEY,
      },
    }
  );

  return response.data.JWTToken;
}

export const trackOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    // use the AWB/waybill saved in your order
    const awb = order.waybill || order.awbNumber;

    if (!awb) {
      return res.status(400).json({
        message: "Blue Dart AWB not generated yet",
      });
    }

    const token = await getBlueDartToken();

    const response = await axios.get(
      "https://apigateway.bluedart.com/in/transportation/tracking/v1",
      {
        params: {
          handler: "tnt",
          action: "custawbquery",
          loginid: process.env.BLUEDART_LOGIN_ID,
          numbers: awb,
          format: "json",
          lickey: process.env.BLUEDART_LICENSE_KEY,
          verno: "1",
          scan: "1",
        },
        headers: {
          JWTToken: token,
        },
      }
    );

    return res.json(response.data);
  } catch (error) {
    console.log(
      "BlueDart Tracking Error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: error.response?.data || error.message,
    });
  }
};