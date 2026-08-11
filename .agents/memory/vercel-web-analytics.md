---
name: Vercel Web Analytics
description: Deployment and local-preview behavior for the site-wide Vercel Web Analytics script.
---

Use the Vercel Web Analytics script on every HTML page for this vanilla HTML/Express site. The `/_vercel/insights/script.js` endpoint is supplied by Vercel after Web Analytics is enabled and a deployment is made; it is not supplied by the local Express server. A development-only JavaScript response keeps the local preview free of 404/MIME errors without shadowing the production endpoint.

**Why:** A local preview of the production script URL otherwise reports a 404 and refuses to execute the response because the fallback asset guard returns `text/plain`.

**How to apply:** Keep the analytics script tag site-wide, enable Web Analytics in the Vercel project dashboard, then deploy. Do not add the Next.js React component to this non-Next.js project.