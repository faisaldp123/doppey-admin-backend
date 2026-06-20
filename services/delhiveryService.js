import axios from "axios";

export const createDelhiveryShipment = async (order) => {
  const payload = {
    pickup_location: {
      name: process.env.DELHIVERY_PICKUP_LOCATION,
    },

    shipments: [
      {
        name: order.address.fullName,
        add: `${order.address.street}, ${order.address.city}, ${order.address.state}`,
        pin: order.address.pincode,
        city: order.address.city,
        state: order.address.state,
        country: "India",
        phone: order.address.phone,
        order: order._id.toString(),
        payment_mode:
          order.paymentMethod === "COD"
            ? "COD"
            : "Prepaid",
        total_amount: order.totalAmount,
        cod_amount:
          order.paymentMethod === "COD"
            ? order.totalAmount
            : 0,
        products_desc: "Fashion Products",
        quantity: order.items.length,
        weight: "500",
        shipping_mode: "Surface",
      },
    ],
  };

  const response = await axios.post(
    "https://track.delhivery.com/api/cmu/create.json",
    payload,
    {
      headers: {
        Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};