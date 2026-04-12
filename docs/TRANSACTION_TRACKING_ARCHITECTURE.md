# Transaction tracking & received-asset architecture

How **on-chain crypto deposits** are tracked in the admin panel, how they differ from **master-wallet** activity, and which **HTTP operations** support listing, detail, timeline, vendor payout, and vendor directory management.

## 1. Two sources of funds

| Concept | Where funds live | Typical use | Ledger (admin) |
|--------|------------------|-------------|----------------|
| **Customer deposit (received asset)** | User **deposit address** (VirtualAccount / Tatum) | Incoming deposits; admin may route liquidity | `received_assets`, `crypto_transactions` (RECEIVE), **`received_asset_disbursements`** |
| **Master wallet** | Platform **master** address per chain | User on-chain send; treasury | `MasterWallet`, **`master_wallet_transactions`** |

**Rule:** Admin sends deposit-side funds to a **vendor** or to the **platform master address** (per normalized chain) → signs from the **customer deposit private key**, records **`ReceivedAssetDisbursement`** (`disbursementType` vendor vs `master_wallet`), **not** `MasterWalletTransaction` from `POST …/master-wallet/send`.

**User-initiated on-chain send (product flow)** may use **master wallet** as signing source per your product rules — do not confuse with **`POST /transaction-tracking/:txId/send-to-vendor`**.

## 2. Transaction tracking API (admin)

Base: `/api/admin`

| Operation | Method & path |
|-----------|----------------|
| List receives | `GET /transaction-tracking` |
| Details (+ `disbursements`) | `GET /transaction-tracking/:txId/details` |
| Timeline steps | `GET /transaction-tracking/:txId/steps` |
| **Deposit → vendor** | `POST /transaction-tracking/:txId/send-to-vendor` |
| **Deposit → master wallet** | `POST /transaction-tracking/:txId/send-to-master-wallet` |

**`:txId`** = `CryptoTransaction.transactionId` (e.g. `RECEIVE-…`).

### `POST /transaction-tracking/:txId/send-to-vendor`

**Body:** `{ "vendorId": number, "amount": string }` — `amount` must equal the **full** `CryptoReceive` amount (decimal string).

**Success `data`:** e.g. `disbursementId`, `txHash`, `amount`, `amountUsd`, `toAddress`, `vendorId`, `networkFee`.

Vendors directory: `GET|POST|PATCH|DELETE /api/admin/vendors`.

Master wallet (separate module): e.g. `POST /api/admin/master-wallet/send` → **`master_wallet_transactions`**, not deposit disbursements.

## 3. Frontend behavior

- **Transaction Tracking** → **Disburse** / detail actions → modal with **To vendor** (`…/send-to-vendor`) and **To master wallet** (`…/send-to-master-wallet`).
- Vendors listed are filtered to **Ethereum** (`network` matches `eth`/`ethereum`) and **currency** matches the receive (product: **ETH** or **USDT**).
- UI blocks payout if `receivedAsset.status` is `sentToVendor` or `transferredToMaster`, or if a **successful** disbursement exists.
- **Master Wallet** page Send/Swap remain **master-custody** operations; copy on that page distinguishes them from deposit → vendor.

## 4. Future extensions

Other `ReceivedAssetDisbursement.disbursementType` values (e.g. Changelly) would get **their own** admin endpoints; same principle: deposit-originated outflows ≠ `master_wallet_transactions` unless the product explicitly merges those flows. **`master_wallet`** consolidation from deposits is implemented via **`send-to-master-wallet`** above.

---

*Align implementation with `prisma/schema` and admin routers. See also `docs/BACKEND_API_CONTRACT.md` (Section B5).*
