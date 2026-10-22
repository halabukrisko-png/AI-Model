# MemoryOrb order confirmation email

- `order-confirmation.liquid.html` – the template for **Shopify** (Settings → Notifications → Customer notifications → Order confirmation → Edit code → paste, Save).
- `order-confirmation.preview.html` – static preview with sample data (open in a browser).
- `memoryorb-logo.png` + `memoryorb-icon-shipping.png`, `memoryorb-icon-guarantee.png`, `memoryorb-icon-protection.png` – logo and the three icons of the trust row; upload all four to Shopify Files. Upload them in Shopify to **Content → Files** and keep the file names, because the template loads them with `{{ 'memoryorb-logo.png' | file_url }}` and so on.

Table layout with inline styles so it renders in Gmail, Apple Mail and Outlook; narrow screens stack the columns.
