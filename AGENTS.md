# Vaultra Price Quotation

## Project

This is a React + TypeScript + Vite quotation builder. It uses shadcn/ui components, Tailwind CSS, and local browser storage. The app is deployed to GitHub Pages at `/vaultra-price-quotation/`.

## Development

```sh
npm install
npm run dev
npm test
npm run build
```

Use `BASE_PATH=/vaultra-price-quotation/ npm run build` when validating the production GitHub Pages path.

## Code conventions

- Keep quote calculations pure and test them in `src/quote.test.ts`.
- Keep external rate parsing isolated in `src/live-rates.ts` and validate every response before applying it.
- Preserve manual rate entry as a fallback when live rates fail or require review.
- Keep customer data in localStorage only. Do not add analytics, server uploads, or external form submissions without explicit authorization.
- Use the Vaultra brand colours: blue `#009BDF`, orange `#FF9F02`, black, and white. Do not reintroduce the previous green palette.
- Keep the printable quote usable on A4 paper and verify `@media print` changes when editing quote layout.

## Deployment

`.github/workflows/deploy.yml` runs tests and a production build on pull requests. Pushes to `main` deploy `dist` to GitHub Pages. Do not commit `node_modules`, `dist`, local environment files, or generated TypeScript build metadata.
