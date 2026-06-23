import axios from "axios";

export const createBlueDartShipment = async (order) => {
  // Check if credentials exist — if not, skip silently
  if (
    !process.env.BLUEDART_LICENSE_KEY ||
    !process.env.BLUEDART_LOGIN_ID    ||
    !process.env.BLUEDART_CLIENT_ID
  ) {
    console.log("BLUEDART: No credentials found, skipping shipment creation");
    return null;
  }

  const payload = {
    Request: {
      Consignee: {
        ConsigneeName:     order.address.fullName,
        ConsigneeAddress1: order.address.street,
        ConsigneeAddress2: "",
        ConsigneePincode:  order.address.pincode,
        ConsigneeMobile:   order.address.phone,
        ConsigneeCity:     order.address.city,
        ConsigneeState:    order.address.state,
        ConsigneeCountry:  "India",
      },
      Shipper: {
        OriginArea:    process.env.BLUEDART_PICKUP_LOCATION || "DEL",
        CustomerCode:  process.env.BLUEDART_CLIENT_ID,
        CustomerName:  "Doppey",
      },
      Services: {
        ProductCode:       "A",
        PaymentMode:       order.paymentMethod === "cod" ? "COD" : "Prepaid",
        CollectableAmount: order.paymentMethod === "cod" ? order.totalAmount : 0,
        DeclaredValue:     order.totalAmount,
        PieceCount:        "1",
        Weight:            "0.5",
        Dimensions: {
          Length:  30,
          Breadth: 20,
          Height:  10,
        },
      },
      SubShipper: {
        SubShipperCode: process.env.BLUEDART_CLIENT_ID,
      },
    },
    Profile: {
      LoginID:    process.env.BLUEDART_LOGIN_ID,
      LicenceKey: process.env.BLUEDART_LICENSE_KEY,
      Api_type:   "S",
      Version:    "1.3",
    },
  };

  const response = await axios.post(
    "https://api.bluedart.com/servlet/RoutingServiceV2",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};