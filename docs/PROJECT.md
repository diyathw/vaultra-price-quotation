# Project documentation

## Purpose

`vaultra-price-quotation` creates standard business quotations for Vaultra storage services. Staff enter customer details, select a unit, review rates and promotions, add fees, and print or save the quotation as PDF.

## Main user flow

1. Open **Quote builder**.
2. Enter customer details and quote validity.
3. Click **Refresh rates** to load current Markham unit rates and availability.
4. Select a live unit type and click **Use this rate**, or enter a manual rate.
5. Review promotion, insurance, administration, lock, moving, and HST values.
6. Save the quote locally or print it. The browser print dialog can save a Letter-size PDF; the print layout is compacted to keep the quotation on one sheet.

## Rate refresh

The live rate client calls the public Markham reservation rate service with the required tenant header. The response is accepted only when it uses four-week billing, provides valid unit data, and has a consistent numeric rate. Recognized offers such as `50% Off 8 Weeks` are converted into a discount and cycle count exactly once. Unknown or inconsistent promotions remain flagged for manual review.

The rate refresh is read-only. It never changes an existing quotation until the user selects **Use this rate**. Rates older than 15 minutes cannot be applied until refreshed. If the endpoint is unavailable or its shape changes, manual pricing remains available.

## Calculation rules

- Rent is rate × quantity × prepaid cycles.
- A rent discount applies to rent only.
- Insurance is charged per unit per four-week cycle.
- Administration, locks, and moving are one-time charges unless the quote explicitly sets quantities.
- HST is calculated once on the rounded subtotal.
- The recurring figure is rent plus insurance and HST for one four-week cycle.

## Moving services

Moving service rates are defined in `src/moving-rates.ts`. The builder can apply regular, storage-promotion, or premium/rush rates by unit size. It also provides quick-add controls for the standard fuel surcharge, after-hours service, and additional stairs. The same module records staff counts, free-moving hours, overage rates, cancellation and reschedule fees, and bin rental packages for future workflow expansion.

The bin rental controls quote a package per cycle and an optional number of unreturned bins at $50 each. Customers can quote bins together with storage or enable **Standalone bin rental (no storage unit)** for bin-only customers. Both appear as separate lines in the printable quotation and are included in the subtotal and HST.

## Storage and privacy

Drafts and saved quotations use this browser’s localStorage. No customer information is sent to the application server. The live rate request sends only the public tenant header to the rate service. Do not add customer uploads, email delivery, or analytics without a separate privacy review and explicit authorization.

## Quick tour lookup

The **Quick prices** workspace view is read-only and separate from quote building. It refreshes the current public Markham inventory rate service and lists prices by floor, unit size, and unit type, so a size such as 5 × 5 can be explained correctly when several unit types have different rates. It also provides a cylinder-lock quantity total and reference prices for moving services and bins. If the service cannot be reached, staff should use the builder’s editable manual-rate fields and confirm the price before quoting.

## Testing

The test suite covers quote calculations, live-rate parsing, promotion handling, malformed responses, unavailable units, validation, and the distinction between local reference rates. Run `npm test` before committing. Run `npm run build` to check TypeScript and the production bundle.
