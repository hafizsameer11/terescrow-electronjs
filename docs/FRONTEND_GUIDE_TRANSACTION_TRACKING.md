# Frontend guide — transaction tracking & vendor disbursement

**Implemented in:** `src/renderer/src/pages/TransactionTrackingPage.tsx`, `ReceivedAssetDispositionModal.tsx`, `TrackingDetailsModal.tsx`, `BulkSendToVendorModal.tsx`, `api/admin/transactionTracking.ts`, `api/config.ts`.

**Base path:** `/api/admin` (see `API_DOMAIN` in `config.ts`).

## Calls

| UI | API |
|----|-----|
| Table list | `GET /transaction-tracking` |
| Detail + disbursements | `GET /transaction-tracking/:txId/details` |
| Steps | `GET /transaction-tracking/:txId/steps` |
| Single send (vendor) | `POST /transaction-tracking/:txId/send-to-vendor` with `{ vendorId }` (amount omitted → full receive) |
| Single send (master) | `POST /transaction-tracking/:txId/send-to-master-wallet` (body optional `amount`; omit → full receive; if set, must equal full receive) |
| Bulk send | `POST /transaction-tracking/bulk-send-to-vendor` with `{ items: [{ receiveTransactionId, vendorId }] }` |
| Vendors | `GET /vendors` (optional `?currency=`) |

**`:txId`** = `transactionId` from the list (e.g. `RECEIVE-…`), URL-encoded in requests.

## Product rules in UI

- Single disburse modal: tabs **To vendor** and **To master wallet**; same eligibility for both (see `canSendToVendor` on the page — blocks if not successful, asset already sent to vendor / transferred to master, or any successful disbursement).
- Bulk (**vendor-only**): same **currency** across selected rows; max **100** items; per-row result table after bulk completes.
- `masterWalletStatus` / disposition labels: `inWallet`, `transferredToMaster`, `sentToVendor`, etc.

Full narrative spec: mirror this document in your backend repo or expand here as needed.
