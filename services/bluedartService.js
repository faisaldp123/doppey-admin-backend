import axios from "axios";

const DEFAULT_BLUEDART_API_URL =
  "https://apigateway.bluedart.com/in/transportation/waybill/v1/GenerateWayBill";

export const extractBlueDartWaybill = (data) => {
  const direct =
    data?.waybill ||
    data?.waybillNo ||
    data?.WayBillNo ||
    data?.awb ||
    data?.awbNo ||
    data?.AWBNo ||
    data?.ShipmentNumber ||
    data?.ShipmentNo ||
    data?.GenerateWayBillResult?.AWBNo ||
    data?.GenerateWayBillResult?.AWBNumber ||
    "";

  if (direct) return String(direct);

  if (!data || typeof data !== "object") return "";

  for (const [key, value] of Object.entries(data)) {
    if (
      value &&
      (typeof value === "string" || typeof value === "number") &&
      /(awb|waybill|shipment)/i.test(key)
    ) {
      return String(value);
    }

    if (value && typeof value === "object") {
      const nested = extractBlueDartWaybill(value);
      if (nested) return nested;
    }
  }

  return "";
};

export const createBlueDartShipment = async (order) => {
  try {
    if (
      !process.env.BLUEDART_LICENSE_KEY ||
      !process.env.BLUEDART_LOGIN_ID ||
      !process.env.BLUEDART_CUSTOMER_CODE
    ) {
      console.log(
        "BLUEDART: Missing License Key, Login ID or Customer Code"
      );
      return null;
    }

    const payload = {
      Request: {
        Consignee: {
          ConsigneeName: order.address.fullName,
          ConsigneeAddress1: order.address.street,
          ConsigneeAddress2: "",
          ConsigneePincode: order.address.pincode,
          ConsigneeMobile: order.address.phone,
          ConsigneeCity: order.address.city,
          ConsigneeState: order.address.state,
          ConsigneeCountry: "India",
        },

        Shipper: {
          OriginArea: process.env.BLUEDART_ORIGIN_AREA || "GGN",
          CustomerCode: process.env.BLUEDART_CUSTOMER_CODE,
          CustomerName:
            process.env.BLUEDART_CUSTOMER_NAME || "Doppey",
        },

        Services: {
          ProductCode:
            process.env.BLUEDART_PRODUCT_CODE || "A",

          PaymentMode:
            order.paymentMethod === "cod"
              ? "COD"
              : "Prepaid",

          CollectableAmount:
            order.paymentMethod === "cod"
              ? Number(order.totalAmount)
              : 0,

          DeclaredValue: Number(order.totalAmount),

          PieceCount: "1",

          Weight:
            process.env.BLUEDART_DEFAULT_WEIGHT || "0.5",

          Dimensions: {
            Length: Number(
              process.env.BLUEDART_LENGTH || 30
            ),
            Breadth: Number(
              process.env.BLUEDART_BREADTH || 20
            ),
            Height: Number(
              process.env.BLUEDART_HEIGHT || 10
            ),
          },
        },

        SubShipper: {
          SubShipperCode:
            process.env.BLUEDART_SUB_SHIPPER_CODE ||
            process.env.BLUEDART_CUSTOMER_CODE,
        },
      },

      Profile: {
        LoginID: process.env.BLUEDART_LOGIN_ID,
        LicenceKey: process.env.BLUEDART_LICENSE_KEY,
        Api_type: "S",
        Version: "1.3",
      },
    };

    console.log(
      "BLUEDART REQUEST:",
      JSON.stringify(payload, null, 2)
    );

    const response = await axios.post(
      process.env.BLUEDART_API_URL ||
        DEFAULT_BLUEDART_API_URL,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          ...(process.env.BLUEDART_JWT_TOKEN
            ? {
                JWTToken:
                  process.env.BLUEDART_JWT_TOKEN,
              }
            : {}),
        },
        timeout: 30000,
      }
    );

    console.log(
      "BLUEDART RESPONSE:",
      response.data
    );

    return {
      raw: response.data,
      waybill: extractBlueDartWaybill(
        response.data
      ),
    };
  } catch (error) {
    console.error(
      "BLUEDART ERROR:",
      error.response?.data || error.message
    );

    return {
      error: true,
      message:
        error.response?.data || error.message,
    };
  }
};