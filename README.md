# vaultra-price-quotation

React + TypeScript + Vite, with official shadcn/ui components and Tailwind CSS.

Live app: https://diyathw.github.io/vaultra-price-quotation/

## Deployment

Every push to `main` runs the calculation tests and production build in GitHub Actions, then deploys `dist` to GitHub Pages. Pull requests run tests and build without deploying. The workflow can also be started manually from the Actions tab. GitHub Pages must use **GitHub Actions** as its publishing source.

The separate **Refresh competitor prices** workflow runs at `17 */6 * * *` (UTC) and can also be started with **Run workflow** in the Actions tab. It fetches published competitor listings, opens Access Storage in Chromium to read its rendered unit prices, validates exact-size rates, builds the app, and deploys the refreshed report. The scheduled snapshot is built into that deployment; it does not commit changing prices to the repository. GitHub may delay scheduled runs, so use each row's capture date and source link before quoting.

The production workflow sets `BASE_PATH=/vaultra-price-quotation/`; local development remains at `/`. The site is public. Customer quotations remain in each visitor's own browser and are not uploaded to GitHub.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Enter customer details, choose a floor and unit, adjust pricing in **Pricing & extras**, and click **Print quotation**. Select **Save as PDF** in the browser print dialog to export. Disable browser headers and footers. Print styling targets US/Canadian Letter paper and compresses the quotation to a single sheet, including moving and bin charges.

Quotes and the current draft are stored in this browser's localStorage. There is no server, customer account, or email delivery. Saved quotes can be opened, edited and printed.

Use **Quick prices** during a tour to check current read-only online storage rent by floor, size, and unit type, calculate a cylinder-lock total, and review moving-bin and moving-service reference prices. This section never changes the active quotation. Use **Refresh rates** before answering a customer; if the public rate service is unavailable, it shows the checked snapshot in `src/web-rates-fallback.json` and labels it as a fallback.

Use **Competitor prices** to compare exact 5 × 5, 5 × 10, and 10 × 10 sizes at nearby Markham facilities. Vaultra rent is refreshed from its live inventory when available. Competitor rates are dated snapshots from public listings; the report converts weekly rent to four weeks and monthly rent to an estimated four-week amount. Promotions, unit features, tax, insurance, and fees may differ. Public Storage exact-size prices come from its public unit listing feed; Access Storage prices come from its rendered booking page; SmartStop prices come from public page text. Any unavailable exact-size price appears as **Check site**. StorageMart has a dated snapshot while its automatic parser cannot validate its current listing.

To refresh competitor prices locally:

```sh
node scripts/scrape-competitors.mjs
npx playwright install chromium
node scripts/scrape-browser-competitors.mjs
BASE_PATH=/vaultra-price-quotation/ npm run build
```

The scripts update `src/competitor-rates.json` only when they find valid exact-size rates. Run them with network access. No customer data is sent to competitor sites.

## Pricing

Click **Refresh rates** to retrieve current Markham prices and availability. Select a size and unit type, then click **Use this rate** to apply regular rent and a recognized promotion. The last-updated time is shown, and existing quotations remain unchanged until a rate is applied. Refresh data older than 15 minutes before applying it. If the rate service is unavailable, enter rates manually. Unrecognized offers require manual review; insurance and extra fees remain separate.

Moving-service rates are available in the **Pricing & extras** tab. Choose a regular, storage-promotion, or premium/rush moving rate by unit size, then add standard fuel, after-hours, or stairs charges when applicable. The rate guide also records included free-move hours, overage rates, staff counts, cancellation and reschedule fees, and bin-rental packages.

Choose floor-specific rates or enter a custom rate. Fifth and sixth floors require manual rates. Prices and promotions are editable and require staff confirmation.

One cycle is 28 days. Insurance is charged per unit per cycle, admin and moving fees once per quotation, locks by quantity. All lines round to cents; tax rounds once on the subtotal.

```sh
npm test
npm run build
```

Tests run with Vitest. Husky runs `npm test` automatically before each commit so calculation and pricing regressions are caught locally before changes are pushed.

The interface is responsive: on smaller screens the sidebar becomes a compact top navigation, the builder and preview stack vertically, and the quotation preview remains printable on Letter paper.
