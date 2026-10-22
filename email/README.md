# MemoryOrb order confirmation email

- `order-confirmation.liquid.html` – the template for **Shopify** (Settings → Notifications → Customer notifications → Order confirmation → Edit code → paste, Save).
- `shipping-confirmation.liquid.html` – the template for the **Shipping confirmation** notification (Settings → Notifications → Customer notifications → Shipping confirmation → Edit code). Shows tracking number, carrier, 'Track your parcel' button and shipped items.
- `shipping-confirmation.preview.html` – static preview of it.
- `order-confirmation.preview.html` – static preview with sample data (open in a browser).
- `memoryorb-logo.png` – logo. The template loads it from the public GitHub copy (`img_base` on the first lines of the template). Once you have your own domain or Shopify Files, upload the image there and change only the `img_base` line.

Table layout with inline styles so it renders in Gmail, Apple Mail and Outlook; narrow screens stack the columns.
