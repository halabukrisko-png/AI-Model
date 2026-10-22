# MemoryOrb order confirmation email

- `order-confirmation.liquid.html` – the template for **Shopify** (Settings → Notifications → Customer notifications → Order confirmation → Edit code → paste, Save).
- `order-confirmation.preview.html` – static preview with sample data (open in a browser).
- `memoryorb-logo.png` – logo. Upload it in Shopify to **Content → Files** and keep the file name `memoryorb-logo.png`, because the template loads it with `{{ 'memoryorb-logo.png' | file_url }}`.

Table layout with inline styles so it renders in Gmail, Apple Mail and Outlook; narrow screens stack the columns.
