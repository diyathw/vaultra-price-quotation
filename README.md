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

## Reference data

All 16 sheets from `Price Quote - BF (2).xlsx` were extracted into `src/workbook-source.json`, including values and formulas. `Whole` supplies floor-specific rate options; `Data` has alternative ground-floor prices accessible in Rates & references. Fifth and sixth floors require manual rates because the workbook has no full rate table for them.

The website https://www.vaultrastorage.ca/markham/8623-mccowan-road/ supplies location contact details and online reservation benefits. Website postal code takes precedence over the older workbook address. Reference prices and historical promotions require staff confirmation; they are not advertised as live rates.

Workbook inconsistencies are explained in Rates & references. Presets follow calculations for the annual discount (10%), lock discount (20%), free moving (5 cycles plus $39.99), and Black Friday admin fee ($19.95). The app does not reproduce broken generic Quotation formulas.

One cycle is 28 days. Insurance is charged per unit per cycle, admin and moving fees once per quotation, locks by quantity. All lines round to cents; tax rounds once on the subtotal, so totals may differ by one cent from unrounded Excel formulas.

```sh
npm test
npm run build
```
