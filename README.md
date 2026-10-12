# vaultra-price-quotation

React + TypeScript + Vite, with official shadcn/ui components and Tailwind CSS.

Live app: https://diyathw.github.io/vaultra-price-quotation/

## Deployment

Every push to `main` runs the calculation tests and production build in GitHub Actions, then deploys `dist` to GitHub Pages. Pull requests run tests and build without deploying. The workflow can also be started manually from the Actions tab. GitHub Pages must use **GitHub Actions** as its publishing source.

The production workflow sets `BASE_PATH=/vaultra-price-quotation/`; local development remains at `/`. The site is public. Customer quotations remain in each visitor's own browser and are not uploaded to GitHub.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Enter customer details, choose a floor and unit, adjust pricing in **Pricing & extras**, and click **Print quotation**. Select **Save as PDF** in the browser print dialog to export. Disable browser headers and footers. Print styling supports A4 and flowing long notes.

Quotes and the current draft are stored in this browser's localStorage. There is no server, customer account, email delivery, or live inventory integration. Saved quotes can be opened, edited and printed.

## Pricing

Choose floor-specific rates or enter a custom rate. Fifth and sixth floors require manual rates. Prices and promotions are editable and require staff confirmation.

One cycle is 28 days. Insurance is charged per unit per cycle, admin and moving fees once per quotation, locks by quantity. All lines round to cents; tax rounds once on the subtotal.

```sh
npm test
npm run build
```
