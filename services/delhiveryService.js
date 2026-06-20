import axios from "axios";

export const createDelhiveryShipment = async (order) => {
try {
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
    order.paymentMethod === "cod"
      ? "COD"
      : "Prepaid",

  cod_amount:
    order.paymentMethod === "cod"
      ? order.totalAmount
      : 0,

  total_amount: order.totalAmount,

  seller_name: "DOPPEY",
  seller_add: "Delhi, India",

  products_desc: "Fashion Products",

  quantity: order.items
    .reduce(
      (sum, item) =>
        sum + item.quantity,
      0
    )
    .toString(),

  weight: "500",
  shipping_mode: "Surface",
}
],
};

console.log("========== DELHIVERY PAYLOAD ==========");
console.log(JSON.stringify(payload, null, 2));

console.log("TOKEN EXISTS:");
console.log(!!process.env.DELHIVERY_API_TOKEN);

console.log("PICKUP LOCATION:");
console.log(process.env.DELHIVERY_PICKUP_LOCATION);

const requestBody = `format=json&data=${encodeURIComponent(JSON.stringify(payload))}`;

const response = await axios.post(
  "https://track.delhivery.com/api/cmu/create.json",
  requestBody,
  {
    headers: {
      Authorization: `Token ${process.env.DELHIVERY_API_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }
);

console.log("========== DELHIVERY SUCCESS ==========");
console.log(response.data);

return response.data;


} catch (error) {


console.log("========== DELHIVERY ERROR ==========");

console.log("STATUS:");
console.log(error.response?.status);

console.log("DATA:");
console.log("FULL ERROR:");

if (error.response) {
  console.log(error.response.data);
} else {
  console.log(error.message);
}

throw error;

}
};
