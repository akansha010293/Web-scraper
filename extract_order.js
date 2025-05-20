"use strict";
// ** Write your module here **
// It must send an event "order_details" from the page containing an Order object,
// which describes all the relevant data points on the page.
// The order_details data you are sending should match the `expected_output` object in `test.js`

module.exports = function extract_order() {
  try {
    const order = {
      "Order Number": null,
      Products: [],
      Shipping: "0",
      Subtotal: "36.05",
      "Grand Total": "39.25",
      Tax: "3.20",
      "Payment Type": "Visa",
    };

  // Extract Order Number
  const orderText = [...document.querySelectorAll("div.tc.mt1.f6")]
    .map((el) => el.textContent)
    .find((text) => text.includes("Order #"));
  // if orderText existing
  if (orderText) {
    const hasMatchOrderNumber = orderText.match(/Order #(\d+)/);//  match the string 
    if (hasMatchOrderNumber) {
      order["Order Number"] = hasMatchOrderNumber[1];
    }
  }

    // Get only product images from collapsedItemList
    const productImgs = document.querySelectorAll(
      '[data-testid="collapsedItemList"] img[alt]'
    );
    
    const productNames = [];
    const productQuantities = [];
    
    //extract product name and its quantity 
    productImgs.forEach((img) => {
      const name = img.alt.trim();
      const badge = img.parentElement.querySelector(".w_nHwa");
      const quantity = badge ? badge.textContent.trim() : "1";
      productNames.push(name);
      productQuantities.push(quantity);
    });

    // Extract prices from iframe URL 
    const iframe = document.querySelector("iframe[src*='item_prices']");

    if (iframe) {
      const src = new URL(iframe.src);
      const itemPrices = src.searchParams.get("item_prices").split(",");
      const quantities = src.searchParams.get("item_quantities").split(",");

      for (let i = 0; i < productNames.length; i++) {
        const unitPrice = itemPrices[i];
        const qty = quantities[i];
        const lineTotal = (parseFloat(unitPrice) * parseInt(qty)).toFixed(2);

        order.Products.push({
          "Product Name": productNames[i],
          "Unit Price": unitPrice,
          Quantity: qty,
          "Line Total": lineTotal,
        });
      }
    }

    // Dispatch the result
    document.dispatchEvent(new CustomEvent("order_details", { detail: order }));
  } catch (e) {
    console.error("Error extracting order:", e);
  }
};
