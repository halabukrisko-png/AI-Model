# /api/track (Vercel serverless function)

Custom tracking for the Tracking page. Needs these **Environment Variables** in Vercel (Project -> Settings -> Environment Variables), then redeploy:

| Name | Needed | What |
|---|---|---|
| `TRACK123_API_SECRET` | yes | Track123 -> Developers -> API |
| `SHOPIFY_STORE_DOMAIN` | for "Order number" tab | e.g. `your-store.myshopify.com` |
| `SHOPIFY_ADMIN_TOKEN` | for "Order number" tab | custom app Admin API token, scope `read_orders` |
| `TRACK_DEBUG` | optional | `1` allows `?debug=1` to return the raw Track123 answer while setting up |

Never commit these values or share them. Without the Shopify variables the "Order number" tab answers that lookup is not available and the "Tracking number" tab works.

The Track123 answer is read tolerantly (field names are searched), because the exact response schema was not confirmed. If events do not show up, set `TRACK_DEBUG=1`, call the endpoint with `?debug=1` once and adjust `normalize()`.

# /api/contact
Sends the Contact form to your e-mail through Resend. Variables: `RESEND_API_KEY`, `CONTACT_TO` (several addresses separated by commas), `CONTACT_FROM` (an address on your verified Resend domain). Redeploy after setting them.
