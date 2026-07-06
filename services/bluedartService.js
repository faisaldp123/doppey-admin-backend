import axios from "axios";

const DEFAULT_BLUEDART_API_URL =
  "https://apigateway.bluedart.com/in/transportation/waybill/v1/GenerateWayBill";

/* ================= GET JWT TOKEN ================= */

async function getBlueDartToken() {
  try {
    const response = await axios.get(
      "https://apigateway.bluedart.com/in/transportation/token/v1/login",
      {
        auth: {
          username: process.env.BLUEDART_LOGIN_ID,
          password: process.env.BLUEDART_LICENSE_KEY,
        },
      }
    );

    console.log("BLUEDART TOKEN GENERATED");

    return response.data.JWTToken;
  } catch (error) {
    console.error(
      "BLUEDART TOKEN ERROR:",
      JSON.stringify(error.response?.data || error.message, null, 2)
    );

    throw error;
  }
}

/* ================= EXTRACT AWB ================= */

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

/* ================= CREATE SHIPMENT ================= */

export const createBlueDartShipment = async (order) => {
  try {
    if (
      !process.env.BLUEDART_LICENSE_KEY ||
      !process.env.BLUEDART_LOGIN_ID ||
      !process.env.BLUEDART_CUSTOMER_CODE
    ) {
      console.log("BLUEDART: Missing credentials");
      return null;
    }

    const missingAddress = [
      "fullName",
      "street",
      "pincode",
      "phone",
      "city",
      "state",
    ].filter((field) => !order.address?.[field]);

    if (missingAddress.length) {
      console.log(
        `BLUEDART: Missing address fields: ${missingAddress.join(", ")}`
      );
      return null;
    }

    const token = await getBlueDartToken();

    console.log(
      "BLUEDART JWT:",
      token.substring(0, 20) + "..."
    );
    console.log("===== SHIPPER ENV =====");

console.log(
  "ADDRESS1:",
  process.env.BLUEDART_SHIPPER_ADDRESS1
);

console.log(
  "PINCODE:",
  process.env.BLUEDART_SHIPPER_PINCODE
);

console.log(
  "PHONE:",
  process.env.BLUEDART_SHIPPER_PHONE
);

console.log(
  "EMAIL:",
  process.env.BLUEDART_SHIPPER_EMAIL
);

console.log("=======================");

    const payload = {
      Request: {
        Consignee: {
          AvailableDays: "",
          AvailableTiming: "",

          ConsigneeName: order.address.fullName,

          ConsigneeAddress1: order.address.street,

          ConsigneeAddress2:
            order.address.locality || "",

          ConsigneeAddress3: "",

          ConsigneeAttention:
            order.address.fullName,

          ConsigneeEmailID:
            order.email || "",

          ConsigneeMobile:
            order.address.phone,

          ConsigneePincode:
            order.address.pincode,

          ConsigneeTelephone: "",

          ConsigneeGSTNumber: "",

          ConsigneeLatitude: "",

          ConsigneeLongitude: "",

          ConsigneeMaskedContactNumber: "",

          ConsigneeAddressType: "",

          ConsigneeAddressinfo: "",

          ConsigneeFullAddress: "",
        },

        Returnadds: {
          ManifestNumber: "",

          ReturnAddress1:
            order.address.street,

          ReturnAddress2: "",

          ReturnAddress3: "",

          ReturnAddressinfo: "",

          ReturnContact:
            process.env.BLUEDART_CUSTOMER_NAME ||
            "Doppey",

          ReturnEmailID:
            order.email || "",

          ReturnLatitude: "",

          ReturnLongitude: "",

          ReturnMaskedContactNumber: "",

          ReturnMobile:
            order.address.phone,

          ReturnPincode:
            order.address.pincode,

          ReturnTelephone: "",
        },

        Services: {
          AWBNo: "",

          ActualWeight:
  Number(
    process.env.BLUEDART_DEFAULT_WEIGHT || 0.5
  ).toFixed(2),

          CollectableAmount:
            order.paymentMethod === "cod"
              ? Number(order.totalAmount)
              : 0,

          DeclaredValue:
            Number(order.totalAmount),

          PieceCount: "1",

          ItemCount: 1,

          ProductCode:
            process.env.BLUEDART_PRODUCT_CODE || "A",

          ProductType: 1,

          SubProductCode: "C",

          PickupDate: `/Date(${Date.now()})/`,

          PickupTime: "1600",

          PDFOutputNotRequired: true,

          CreditReferenceNo:
  `ORD${Date.now().toString().slice(-10)}`,

          IsDedicatedDeliveryNetwork: false,

          IsDutyTaxPaidByShipper: false,

          IsForcePickup: false,

          IsPartialPickup: false,

          IsReversePickup: false,

          RegisterPickup: false,

          TotalCashPaytoCustomer: 0,

          Officecutofftime: "",

          PackType: "",

          ParcelShopCode: "",

          PayableAt: "",

          PickupMode: "",

          PickupType: "",

          PreferredPickupTimeSlot: "",

          ProductFeature: "",

          DeliveryTimeSlot: "",

          FavouringName: "",

          SpecialInstruction: "",

          Commodity: {
            CommodityDetail1: "Fashion",

            CommodityDetail2: "Clothing",

            CommodityDetail3: "Ecommerce",
          },

          Dimensions: [
            {
              Length: Number(
                process.env.BLUEDART_LENGTH || 30
              ),

              Breadth: Number(
                process.env.BLUEDART_BREADTH || 20
              ),

              Height: Number(
                process.env.BLUEDART_HEIGHT || 10
              ),

              Count: 1,
            },
          ],

          itemdtl: [
            {
              ItemID: "ITEM1",

              ItemName: "Product",

              ItemValue:
                Number(order.totalAmount),

              Itemquantity: 1,

              TotalValue:
                Number(order.totalAmount),

              InvoiceNumber: "",

              InvoiceDate:
                `/Date(${Date.now()})/`,

              ProductDesc1: "",

              ProductDesc2: "",

              SubProduct1: "",

              SubProduct2: "",

              Instruction: "",

              ReturnReason: "",

              PlaceofSupply: "",

              HSCode: "",

              SellerName: "",

              SellerGSTNNumber: "",

              SKUNumber: "",

              countryOfOrigin: "",

              docType: "",

              supplyType: "",

              subSupplyType: 0,

              CGSTAmount: 0,

              SGSTAmount: 0,

              IGSTAmount: 0,

              TaxableAmount: 0,

              cessAmount: "0.0",
            },
          ],

          noOfDCGiven: 0,
        },

        Shipper: {
  CustomerCode:
    process.env.BLUEDART_CUSTOMER_CODE,

  CustomerName:
    process.env.BLUEDART_CUSTOMER_NAME ||
    "Doppey",

  CustomerAddress1:
    process.env.BLUEDART_SHIPPER_ADDRESS1,

  CustomerAddress2:
    process.env.BLUEDART_SHIPPER_ADDRESS2 || "",

  CustomerAddress3:
    process.env.BLUEDART_SHIPPER_ADDRESS3 || "",

  CustomerAddressinfo: "",

  CustomerBusinessPartyTypeCode: "",

  CustomerEmailID:
    process.env.BLUEDART_SHIPPER_EMAIL || "",

  CustomerGSTNumber: "",

  CustomerLatitude: "",

  CustomerLongitude: "",

  CustomerMaskedContactNumber: "",

  CustomerMobile:
    process.env.BLUEDART_SHIPPER_PHONE,

  CustomerPincode:
    process.env.BLUEDART_SHIPPER_PINCODE,

  CustomerTelephone: "",

  IsToPayCustomer: false,

  OriginArea:
    process.env.BLUEDART_ORIGIN_AREA || "DEL",

  Sender:
    process.env.BLUEDART_CUSTOMER_NAME ||
    "Doppey",

  VendorCode: "",
},
SubShipper: {
  SubShipperCode:
    process.env.BLUEDART_CUSTOMER_CODE,
},
      },

      Profile: {
        LoginID:
          process.env.BLUEDART_LOGIN_ID,

        LicenceKey:
          process.env.BLUEDART_LICENSE_KEY,

        Api_type: "S",
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
          JWTToken: token,
        },
        timeout: 30000,
      }
    );

    console.log(
      "BLUEDART RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    const waybill =
      extractBlueDartWaybill(response.data);

    console.log(
      "EXTRACTED WAYBILL:",
      waybill
    );

    return {
      raw: response.data,
      waybill,
    };
  } catch (error) {
    console.error(
      "BLUEDART ERROR FULL:",
      JSON.stringify(
        error.response?.data ||
          error.message,
        null,
        2
      )
    );

    return {
      error: true,
      message:
        error.response?.data ||
        error.message,
    };
  }
};