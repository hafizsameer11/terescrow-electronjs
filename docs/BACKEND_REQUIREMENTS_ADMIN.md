# Backend API Requirements for Admin App

This document lists all **new or changed** admin features that currently use **frontend-only mock data** and specifies what the backend must provide so the admin app can be wired to real APIs.

**Auth:** All endpoints below are for the **admin** (Electron) app. Assume requests include the existing auth mechanism (e.g. Bearer token / session) and that the backend already distinguishes admin/auditor/agent roles where needed.

**API base and envelope:** New admin endpoints live under **`/api/admin`** (e.g. `/api/admin/transactions`, `/api/admin/user-balances`). The app uses a dedicated base (`API_ADMIN_BASE = API_DOMAIN + '/admin'`) for these; existing operations URLs are unchanged. All new endpoints return a standard envelope: `{ "status": "success" | "error", "message": "...", "data": { ... } }`. The frontend unwraps `data` in the API layer; errors read `message` from the body when present.

**Agreed conventions:**

| Area | Convention |
|------|------------|
| **Daily Report `gracePeriod`** | Backend may send a number (minutes, e.g. `15`). The frontend normalizes to a string for display (e.g. `"00:15"`) via `normalizeGracePeriod`. If the backend sends a string (e.g. `"00:15"`), it is used as-is. |
| **Support chat filter** | Backend uses `status`: `"pending"`, `"processing"`, or `"completed"`. Frontend tabs map as: **All** → no filter; **Active** → `processing`; **Unread** → `unread` (or derived from `unreadCount > 0`); **Closed** → `completed`. |
| **Referrals by-user** | Backend endpoint is `GET /api/admin/referrals/by-user/:userId`. The referral **list** must include a stable **`id` or `userId`** per row. The frontend calls `by-user/${selectedUser.id}` (or `userId`), not by name. |

---

## Transaction menus (separate sidebar entries)

The admin sidebar has **separate menu items** for each transaction type. Each opens the same Transactions page but with a different category pre-selected:

| Menu label           | Route                          | Pre-selected tab  |
|----------------------|--------------------------------|-------------------|
| Chats                | `/chats`                       | —                 |
| Gift Card Chats      | `/chats` (gift card context)   | —                 |
| **Gift Card Buy Txns** | `/transactions/gift-card-buy` | Gift Cards        |
| **Crypto Txns**      | `/transactions/crypto`         | Crypto            |
| **Bill Payments**    | `/transactions/bill-payments`  | Bill Payments     |
| **Naira Txns**       | `/transactions/naira`          | Naira             |

### Data needed from backend

The app currently uses a **single transactions API** (`getTransactions`) and filters client-side by type (via `department.niche`, `department.title`, `category.title`). For these **separate transaction menus** the backend should either:

- **Option A:** Keep a single **GET** that returns all transactions; frontend continues to filter by `transactionType` (giftCards | crypto | billPayments | naira). Ensure each transaction has fields that allow correct classification (e.g. `department.niche`, `department.title`, `category.title`).
- **Option B:** Support a **transactionType** (or **category**) query param on the existing transactions endpoint so each menu can request only the relevant type (e.g. `GET /admin/transactions?transactionType=giftCards`), reducing payload and enabling server-side filtering/pagination per type.

### Suggested endpoint (if not already present)

- **GET** `/admin/transactions` (or existing equivalent)  
  - **Query:** `transactionType?` (e.g. `giftCards` | `crypto` | `billPayments` | `naira`), `status?`, `type?`, `startDate?`, `endDate?`, `search?`, `page?`, `limit?`  
  - **Response:** List of transactions with at least: `id`, `status`, `createdAt`, `department` (e.g. `{ title?, niche? }`), `category` (e.g. `{ title? }`), and any fields needed for the transaction table and details modal (customer, amount, etc.).  
  - **Classification:** Backend must tag or structure data so the frontend can map each row to exactly one of: Gift Cards, Crypto, Bill Payments, Naira (e.g. via `department.niche` or a dedicated `transactionType` field).

### Summary

- **Gift Card Buy Txns**, **Crypto Txns**, **Bill Payments**, and **Naira Txns** are four **separate** sidebar entries and routes; each must show only that transaction type.
- Backend should either return all transactions with clear type/department/category info, or support filtering by transaction type so these menus get the correct data efficiently.

---

## 1. User Balances

**Screen:** User Balances (`/user-balances`) — table of users with balances (Name, Email, Total $/N, Crypto $/N, Naira), sort dropdown, Start/End Date, Last 30 days, Search.

### Data needed from backend

| Purpose | Description |
|--------|-------------|
| List user balances | Paginated/filterable list of users with their balance summary. |

### Suggested endpoints

- **GET** `/admin/user-balances` (or equivalent)  
  - **Query:** `sort`, `startDate`, `endDate`, `dateRange` (e.g. Last 30 days), `search`, `page`, `limit`  
  - **Response (per row):** `id`, `name`, `email`, `totalBalanceUsd`, `totalBalanceN` (or NGN string), `cryptoBalanceUsd`, `cryptoBalanceN`, `nairaBalance`  
  - Frontend expects strings for display (e.g. `"$5,000"`, `"N20,005,000"`). Backend can return numbers and let frontend format, or return formatted strings.

---

## 2. Master Wallet

**Screen:** Master Wallet (`/master-wallet`) — wallet selector (Tercescrow, Yellow Card, Palmpay), balance card, assets table, modals: Wallet Assets, Transaction History, Send, Swap.

### Data needed from backend

| Purpose | Description |
|--------|-------------|
| Wallet options | Fixed list of wallet types (ids + labels). Can remain frontend config if fixed. |
| Balance summary per wallet | For the green card: total USD, NGN, optional BTC; for Palmpay also accountName, accountNumber. |
| Assets per wallet | For table and Wallet Assets modal: symbol, name, balance, usdValue, address; per-wallet breakdown (tercescrow/yellowCard/tatum) if applicable. |
| Transactions per asset | For Transaction History modal: list of txs (to, status, type, wallet, amount, date) filterable by wallet. |
| Send / Swap | Frontend currently only submits form data; backend should persist/process send and swap actions. |

### Suggested endpoints

- **GET** `/admin/master-wallet/balances`  
  - **Response:** Map or array of balance summary per wallet id (e.g. `tercescrow`, `yellowcard`, `palmpay`) with `totalUsd`, `totalNgn`, `totalBtc?`, `accountName?`, `accountNumber?`, `label`.

- **GET** `/admin/master-wallet/assets`  
  - **Query:** optional `walletId`  
  - **Response:** List of assets with `symbol`, `name`, `balance`, `usdValue`, `address`, and per-wallet fields (e.g. `tercescrowBalance`, `tercescrowUsd`, `yellowCardBalance`, …) as needed for table and modal.

- **GET** `/admin/master-wallet/transactions`  
  - **Query:** `assetSymbol`, `walletId?`  
  - **Response:** List of transactions: `id`, `to`, `status` (successful | pending | failed), `type`, `wallet`, `amount`, `date`, `assetSymbol`, `walletId`.

- **POST** `/admin/master-wallet/send`  
  - **Body:** `address`, `amountCrypto`, `amountDollar`, `network`, `symbol`, optional `vendorId` or recipient info.  
  - **Response:** Success/failure and optionally new balances or tx id.

- **POST** `/admin/master-wallet/swap`  
  - **Body:** From/to symbols, amounts, receiving wallet, etc. as in Swap modal.  
  - **Response:** Success/failure and optionally new balances or tx id.

---

## 3. Vendors (Settings)

**Screen:** Settings > Vendors (`/settings/vendors` and `/settings?tab=vendors`) — CRUD for “Send” vendors (name, network, currency, wallet address, notes). Same vendors appear in Master Wallet Send modal as a dropdown.

### Data needed from backend

| Purpose | Description |
|--------|-------------|
| List vendors | All vendors (optionally filterable by currency for Send modal). |
| Create vendor | Name, network, currency, walletAddress, notes. |
| Update vendor | Same fields, by id. |
| Delete vendor | By id. |

### Suggested endpoints

- **GET** `/admin/vendors`  
  - **Query:** optional `currency` (for Send modal).  
  - **Response:** Array of `{ id, name, network, currency, walletAddress, notes?, createdAt }`.

- **POST** `/admin/vendors`  
  - **Body:** `name`, `network`, `currency`, `walletAddress`, `notes?`.  
  - **Response:** Created vendor with `id`, `createdAt`.

- **PATCH** `/admin/vendors/:id`  
  - **Body:** Partial `name`, `network`, `currency`, `walletAddress`, `notes`.  
  - **Response:** Updated vendor.

- **DELETE** `/admin/vendors/:id`  
  - **Response:** 204 or success.

**Network/currency:** Frontend uses fixed enums (e.g. Ethereum, Base, … and BTC, ETH, USDT, …). Backend can validate against the same or its own list.

---

## 4. Daily Report

**Screen:** Daily Report (`/daily-report`) — Agent: Check In/Check Out, My Report, report details. Admin/Auditor: All Reports, Shift Settings, Approve/Disapprove report.

### Data needed from backend

| Purpose | Description |
|--------|-------------|
| Shift settings | Day/Night check-in, check-out, grace period (used by Check In modal and logic). |
| Daily logs | List of attendance rows (employee, day, shift, date, checkInTime, checkOutTime, status, amountMade, reportPreview, reportId). For agent: filter by current user. For admin/auditor: all agents. |
| Report detail | Full report by reportId: agent info, clock in/out, active hours, chat stats, Gift Card / Crypto / Bill Payments summaries, Chat breakdown, Financials, myReport, auditorsReport, status (approved | not_approved). |
| Summary stats | For cards: activeHours, trend, amountEarned, department (for current agent or selected scope). |
| Charts | Avg work hours (e.g. 7 days), work hours per month (work vs overtime). |
| Check In / Check Out | Record agent check-in or check-out (shift, timestamp). |
| Shift settings update | Admin/auditor saves day/night check-in, check-out, grace period. |
| Approve / Disapprove report | Admin/auditor sets report status and optionally auditorsReport text. |

### Suggested endpoints

- **GET** `/admin/daily-report/shift-settings`  
  - **Response:** `{ day: { checkIn, checkOut, gracePeriod }, night: { checkIn, checkOut, gracePeriod } }` (e.g. time strings "09:00").

- **PUT** `/admin/daily-report/shift-settings`  
  - **Body:** Same shape as above.  
  - **Response:** Updated settings.  
  - **Auth:** Admin/auditor only.

- **GET** `/admin/daily-report/logs`  
  - **Query:** `startDate`, `endDate`, `shift?`, `agentId?` (omit for all-reports view).  
  - **Response:** Array of daily log entries: `id`, `employeeId?`, `employeeName`, `day`, `shift`, `date`, `checkInTime`, `checkOutTime`, `status`, `amountMade`, `reportPreview`, `reportId?`.

- **GET** `/admin/daily-report/reports/:reportId`  
  - **Response:** Full report detail (date, agentName, position, shift, auditorName, clockInTime, clockOutTime, activeHours, totalChatSessions, avgResponseTimeSec, giftCard, crypto, billPayments, chat, financials, status, myReport, auditorsReport).

- **GET** `/admin/daily-report/summary`  
  - **Query:** optional `agentId` (for “My Report”).  
  - **Response:** `activeHours`, `activeHoursTrend`, `amountEarned`, `department`.

- **GET** `/admin/daily-report/charts/avg-work-hours`  
  - **Query:** e.g. `days=7`.  
  - **Response:** Array of `{ day, hours }`.

- **GET** `/admin/daily-report/charts/work-hours-per-month`  
  - **Query:** e.g. `months=3`.  
  - **Response:** Array of `{ month, workHrs, overTimeHrs }`.

- **POST** `/admin/daily-report/check-in`  
  - **Body:** `shift` (Day | Night), `timestamp?` (default now).  
  - **Response:** Success and updated log entry or id.  
  - **Auth:** Agent (own check-in).

- **POST** `/admin/daily-report/check-out`  
  - **Body:** `timestamp?`.  
  - **Response:** Success and updated log entry.  
  - **Auth:** Agent (own check-out).

- **PATCH** `/admin/daily-report/reports/:reportId`  
  - **Body:** `status?` (approved | not_approved), `auditorsReport?`, `myReport?`.  
  - **Response:** Updated report.  
  - **Auth:** Admin/auditor for status and auditorsReport; agent possibly for myReport only.

---

## 5. Transaction Tracking

**Screen:** Track Crypto Transactions (`/transaction-tracking`) — type filters (Send, Receive, Buy, Sell, Swap), date range, search, table (Name, Status, TX ID, Type, Amount, Date), and Tracking Details modal (step cards + Transaction Details tab).

### Data needed from backend

| Purpose | Description |
|--------|-------------|
| List tracked transactions | Filter by txType, dateRange, search (name, txId, type). |
| Tracking steps | For a given tx id: ordered list of steps (title, crypto, network, route, action?, date, fromAddress?, address?, toAddress?, transactionHash?, txHash?, status). |
| Transaction details | For a given tx id: amountDollar, amountNaira, serviceType, cryptoType, cryptoChain, cryptoAmount, sendAddress, receiverAddress, transactionHash, transactionId, transactionStatus. |

### Suggested endpoints

- **GET** `/admin/transaction-tracking`  
  - **Query:** `txType` (Send | Receive | Buy | Sell | Swap), `dateRange?`, `search?`, `startDate?`, `endDate?`, `page?`, `limit?`.  
  - **Response:** Array of `{ id, name, status, txId, type, amount, date, txType }`.

- **GET** `/admin/transaction-tracking/:txId/steps`  
  - **Response:** Array of tracking steps (title, crypto, network, route, action?, date, fromAddress?, address?, toAddress?, transactionHash?, txHash?, status).

- **GET** `/admin/transaction-tracking/:txId/details`  
  - **Response:** Single object: amountDollar, amountNaira, serviceType, cryptoType, cryptoChain, cryptoAmount, sendAddress, receiverAddress, transactionHash, transactionId, transactionStatus.

---

## 6. Referrals

**Screen:** Referrals (`/referrals`) — summary cards (All Users, Total Referred, Amount Paid Out), type tabs (All, General %, Custom %), search, table (Name, Email, Joined, No of referrals, Downline Referrals, Amount Earned, View / Edit %). Modals: “Referrals by [User]” (expandable list with stats and earnings), “Earn Settings” (first time deposit bonus %, commission on referral trades %, commission on downline trades %).

### Data needed from backend

| Purpose | Description |
|--------|-------------|
| Summary | allUsers count, optional trend, totalReferred count, amountPaidOut. |
| Referral list | Filter by type, search, startDate, endDate; columns as in table. |
| Referrals by user | For “Referrals by [User]” modal: list of referred users with referredName, referredAt, stats (giftCardBuy, giftCardSell, cryptoTrades, noOfUsersReferred), earned (amountEarnedFromTrades, fromGcTrades, fromCryptoTrades, fromDownlines). |
| Earn settings | Get/update global settings: firstTimeDepositBonusPct, commissionReferralTradesPct, commissionDownlineTradesPct. |
| Edit % (per user) | Optional: per-referral or per-user commission rate; UI has “Edit %” button, backend may expose per-user or per-tier override. |

### Suggested endpoints

- **GET** `/admin/referrals/summary`  
  - **Query:** optional `startDate`, `endDate`.  
  - **Response:** `allUsers`, `allUsersTrend?`, `totalReferred`, `amountPaidOut`.

- **GET** `/admin/referrals`  
  - **Query:** `type?` (All | General % | Custom %), `search?`, `startDate?`, `endDate?`, `page?`, `limit?`.  
  - **Response:** Array of `{ id, name, email, joined, noOfReferrals, downlineReferrals, amountEarned }`.

- **GET** `/admin/referrals/by-user/:userId` or `?userId=...` or `?referrerName=...`  
  - **Response:** Array of `{ referredName, referredAvatar?, referredAt, stats: { giftCardBuy, giftCardSell, cryptoTrades, noOfUsersReferred }, earned: { amountEarnedFromTrades, fromGcTrades, fromCryptoTrades, fromDownlines } }`.

- **GET** `/admin/referrals/earn-settings`  
  - **Response:** `{ firstTimeDepositBonusPct, commissionReferralTradesPct, commissionDownlineTradesPct }`.

- **PUT** `/admin/referrals/earn-settings`  
  - **Body:** Same three percentage fields.  
  - **Response:** Updated settings.

- **PATCH** `/admin/referrals/:id/percentage` (optional, for “Edit %”)  
  - **Body:** e.g. `{ commissionPct? }` or type-specific override.  
  - **Response:** Updated referral row or success.

---

## 7. Support (Chat)

**Screen:** Support (`/support`) — two panels: chat list (Search, All/Active/Unread/Closed, avatar, name, last message, time, unread count) and conversation (header with name, Online, Close Chat; messages; “Type Anything” + attachment + send).

### Data needed from backend

| Purpose | Description |
|--------|-------------|
| List support chats | Filter by All/Active/Unread/Closed, search by participant name. |
| Messages for a chat | Paginated or full list of messages (id, sender: user | agent, text, time). |
| Send message | Agent sends a message in a support chat. |
| Mark read / Close chat | Update unread count and/or chat status (e.g. closed). |
| Real-time (optional) | WebSocket or polling for new messages and chat list updates. |

### Suggested endpoints

- **GET** `/admin/support/chats`  
  - **Query:** `filter` (All | Active | Unread | Closed), `search?`, `page?`, `limit?`.  
  - **Response:** Array of `{ id, participantName, participantAvatar?, lastMessage, lastMessageSender, lastMessageTime, unreadCount, status }`.

- **GET** `/admin/support/chats/:chatId/messages`  
  - **Query:** `before?`, `limit?` for pagination.  
  - **Response:** Array of `{ id, sender, text, time }` (sender: "user" | "agent").

- **POST** `/admin/support/chats/:chatId/messages`  
  - **Body:** `text`, optional `attachmentUrl` or multipart file.  
  - **Response:** Created message (id, sender: "agent", text, time).  
  - **Side effect:** Update lastMessage, lastMessageTime, optionally unreadCount for user side.

- **PATCH** `/admin/support/chats/:chatId**  
  - **Body:** `status?` (e.g. closed), `markRead?` (reset unreadCount for agent view).  
  - **Response:** Updated chat.

---

## 8. Customer Freeze & Ban (existing UI, needs API)

**Screen:** Customers table — row menu: “Freeze feature”, “Ban Account”. Freeze opens a modal (select feature: Deposit, Withdrawal, Send/Receive/Swap/Buy/Sell Crypto, Buy/Sell Gift Card; Proceed).

### Data needed from backend

| Purpose | Description |
|--------|-------------|
| Freeze feature | Apply or lift freeze for a customer for a specific feature. |
| Ban account | Ban (or block) customer account; clarify if same as existing “Block User” or separate (permanent vs temporary). |

### Suggested endpoints

- **POST** `/admin/customers/:customerId/freeze** (or similar)  
  - **Body:** `feature` (string matching modal options, e.g. "Deposit", "Withdrawal", "Send/Receive/Swap/Buy/Sell Crypto", "Buy/Sell Gift Card").  
  - **Response:** Success and optionally updated customer or freeze list.

- **POST** `/admin/customers/:customerId/unfreeze**  
  - **Body:** `feature`.  
  - **Response:** Success.

- **POST** `/admin/customers/:customerId/ban**  
  - **Body:** Optional `reason?`, `permanent?: boolean` if different from block.  
  - **Response:** Success.  
  - **Note:** If “Ban” is the same as existing block user, document that and reuse existing endpoint.

---

## Summary table

| Feature | Main GET list/detail | Mutations (POST/PATCH/PUT/DELETE) |
|---------|----------------------|------------------------------------|
| **Transaction menus** (Gift Card Buy Txns, Crypto Txns, Bill Payments, Naira Txns) | transactions (with optional `transactionType` filter) | — |
| User Balances | user-balances | — |
| Master Wallet | balances, assets, transactions | send, swap |
| Vendors | vendors | create, update, delete |
| Daily Report | shift-settings, logs, report, summary, charts | check-in, check-out, update shift-settings, approve/disapprove report |
| Transaction Tracking | list, steps, details | — (read-only in current UI) |
| Referrals | summary, list, by-user, earn-settings | update earn-settings, optional edit % |
| Support | chats, messages | send message, update chat (close/mark read) |
| Customer Freeze/Ban | — | freeze, unfreeze, ban |

---

## Frontend data files to replace

When backend is ready, replace or wire these modules to API calls instead of in-memory data:

- `src/renderer/src/pages/UserBalancesPage.tsx` — replace `MOCK_USER_BALANCES` with API.
- `src/renderer/src/data/masterWalletData.ts` — replace with Master Wallet APIs.
- `src/renderer/src/data/vendorData.ts` — replace with Vendors APIs.
- `src/renderer/src/data/dailyReportData.ts` — replace with Daily Report APIs.
- `src/renderer/src/data/transactionTrackingData.ts` — replace with Transaction Tracking APIs.
- `src/renderer/src/data/referralsData.ts` — replace with Referrals APIs.
- `src/renderer/src/data/supportData.ts` — replace with Support APIs.
- `src/renderer/src/components/CustomerTable.tsx` — wire Freeze and Ban to backend (see section 8).

All response shapes above are aligned with the current frontend types so that, once endpoints exist, the admin app can call them and map responses with minimal changes.
