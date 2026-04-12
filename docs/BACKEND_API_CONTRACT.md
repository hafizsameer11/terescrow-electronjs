# Complete Backend API Contract for Admin Frontend

**Base URL:** `https://backend.tercescrow.site`  
**Auth:** Bearer token in `Authorization` header for all endpoints.  
**Envelope (new endpoints):** `{ "status": "success" | "error", "message": "...", "data": { ... } }`  
**Errors:** 4xx/5xx with `{ "status": "error", "message": "..." }`

This document covers **every endpoint** the admin frontend calls, the exact request params, and response shapes expected. Organized into:

- **Section A** – Existing endpoints (already on `/api/admin/operations/*` and `/api/agent/*`)
- **Section B** – New admin endpoints (need to be built on `/api/admin/*`)
- **Section C** – Missing fields on existing endpoints

---

## Section A: Existing Endpoints

These endpoints are already called by the frontend. Listed so the backend team can verify they return the correct shapes from the new domain.

---

### A1. Dashboard

**Page:** `/dashboard`

#### GET `/api/admin/operations/get-dashboard-stats`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "totalUsers":          { "count": 1500,  "change": "positive", "percentage": 12 },
    "totalTransactions":   { "count": 8200,  "change": "positive", "percentage": 8 },
    "totalDepartments":    { "count": 5 },
    "totalAgents":         { "count": 25,    "change": "positive", "percentage": 5 },
    "totalVerifiedUsers":  { "count": 1200,  "change": "positive", "percentage": 10 },
    "totalInflow":         { "current": 50000000, "change": "positive", "percentage": 15 },
    "totalOutflow":        { "current": 30000000, "change": "negative", "percentage": 3 },
    "totalRevenue":        { "current": 20000000, "change": "positive", "percentage": 20 }
  }
}
```

Notes:
- `totalInflow.current`, `totalOutflow.current`, `totalRevenue.current` are numbers in Naira. Frontend formats with `N` prefix and thousand separators.
- `change` is `"positive"` or `"negative"`. `percentage` is a number (displayed as e.g. "12%").

#### GET `/api/admin/operations/get-all-transactions` (OLD — gift card sale only)

> **WARNING:** This endpoint only returns gift card sale transactions. Dashboard should migrate to `GET /api/admin/transactions` (see B9.1) to show all transaction types.

Response:

```json
{
  "data": [ GiftCardSaleTransaction, ... ]
}
```

See **Transaction Object Shape** below for the full shape including type-specific fields.

---

### A2. Transactions (OLD — GIFT CARD SALE ONLY)

> **CRITICAL ISSUE:** The existing endpoint `GET /api/admin/operations/get-all-transactions` **only returns gift card sale transactions**. It does NOT return crypto, gift card buy, bill payment, or naira transactions. The same problem applies to `GET /api/admin/operations/get-customer-transactions/:id`.
>
> **Action required:** Keep the old endpoint for backward compatibility (gift card sale only), but **new endpoints are needed** for each transaction type. See **Section B9** below for the full specification of new transaction endpoints.

**Pages:** `/transactions`, `/transactions/gift-card-buy`, `/transactions/crypto`, `/transactions/bill-payments`, `/transactions/naira`

The frontend has five tabs: All, Gift Cards, Crypto, Bill Payments, Naira. Currently it fetches from the old endpoint and filters client-side by `department.niche`, but that only works for gift card sale data.

#### GET `/api/admin/operations/get-all-transactions` (KEEP — gift card sale only)

This endpoint should remain as-is. It returns gift card sale transactions only.

Response:

```json
{
  "data": [ GiftCardSaleTransaction, ... ]
}
```

#### GET `/api/admin/operations/get-transaction-stats`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "totalTransactions": {
      "count": 8200,
      "change": "positive",
      "percentage": 8
    },
    "totalTransactionAmountSum": {
      "_sum": { "amount": 500000, "amountNaira": 200000000 },
      "change": "positive",
      "percentage": 12
    },
    "cryptoTransactions": {
      "_count": 3000,
      "_sum": { "amount": 250000, "amountNaira": 100000000 },
      "change": "positive",
      "percentage": 10
    },
    "giftCardTransactions": {
      "_count": 2000,
      "_sum": { "amount": 150000, "amountNaira": 60000000 },
      "change": "positive",
      "percentage": 5
    }
  }
}
```

Notes:
- `_sum.amount` is USD, `_sum.amountNaira` is Naira.
- Frontend displays `cryptoTransactions._sum.amount` and `giftCardTransactions._sum.amount` with `$` prefix.
- **This stats endpoint should also be updated** to include `billPaymentTransactions` and `nairaTransactions` counts/sums (see B9).

---

### Transaction Object Shape (Base — all types share these fields)

Used by Dashboard, Transactions, TransactionDetails, and Log pages.

```json
{
  "id": 123,
  "transactionId": "TXN-ABC123",
  "status": "successful",
  "amount": 250.00,
  "amountNaira": 100000,
  "createdAt": "2025-11-06T10:30:00.000Z",
  "updatedAt": "2025-11-06T10:35:00.000Z",
  "profit": 15.50,
  "department": {
    "id": 1,
    "title": "Buy Crypto",
    "description": "...",
    "icon": "crypto.png",
    "niche": "crypto",
    "Type": "buy",
    "status": "active",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "category": {
    "id": 10,
    "title": "Bitcoin",
    "subTitle": "BTC",
    "image": "btc.png",
    "status": "active",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "subCategory": {
    "id": 100,
    "title": "Buy BTC with Naira"
  },
  "customer": {
    "id": 50,
    "username": "john_doe",
    "firstname": "John",
    "lastname": "Doe",
    "profilePicture": "avatar.jpg",
    "role": "customer",
    "country": "Nigeria"
  },
  "agent": {
    "id": 5,
    "username": "agent_smith",
    "firstname": "Agent",
    "lastname": "Smith",
    "profilePicture": "agent.jpg",
    "role": "agent"
  }
}
```

### Type-Specific Fields (returned alongside base fields)

Each transaction type adds extra fields. The backend MUST include these in the response based on the transaction's niche/type.

#### Gift Card transactions (`niche: "giftcard"`)
```json
{
  "cardType": "Amazon",
  "cardNumber": "XXXX-XXXX-1234",
  "giftCardSubType": "Physical"
}
```
Frontend displays: Gift Card Type, Gift Card Number.

#### Crypto transactions (`niche: "crypto"`)
```json
{
  "fromAddress": "0xabc123...",
  "toAddress": "0xdef456..."
}
```
Frontend displays: To Address, From Address.

#### Bill Payment transactions (`niche: "billpayment"`)
```json
{
  "billType": "Airtime",
  "billReference": "REF-12345",
  "billProvider": "MTN"
}
```
Frontend displays: Bill Type, Bill Reference, Provider.

#### Naira transactions (`niche: "naira"`)
```json
{
  "nairaType": "deposit",
  "nairaChannel": "Bank Transfer",
  "nairaReference": "NAI-67890"
}
```
Frontend displays: Type (deposit/withdrawal), Channel, Reference.

**Key fields for filtering:**
- `department.niche`: `"crypto"`, `"giftcard"`, `"billpayment"`, `"naira"` — used to separate transactions into the four menu tabs.
- `department.Type`: `"buy"` or `"sell"` — used for buy/sell filter.
- `status`: `"successful"`, `"pending"`, `"declined"`, etc.

---

### A3. Customer Transaction Details (OLD — GIFT CARD SALE ONLY)

> **SAME ISSUE:** `GET /api/admin/operations/get-customer-transactions/:id` only returns gift card sale transactions for a customer. A new endpoint is needed that returns ALL transaction types for a given customer. See **Section B9** below.

**Page:** `/transaction-details/:customerId`

#### GET `/api/admin/operations/get-customer-transactions/:id` (KEEP — gift card sale only)

Response:

```json
{
  "data": [ GiftCardSaleTransaction, ... ]
}
```

Same base + gift card fields as above, filtered for one customer.

---

### A4. Customers List

**Page:** `/customers`

#### GET `/api/admin/operations/get-all-customers`

Response:

```json
{
  "data": [
    {
      "id": 50,
      "firstname": "John",
      "lastname": "Doe",
      "username": "john_doe",
      "email": "john@example.com",
      "phoneNumber": "+2348012345678",
      "gender": "Male",
      "country": "Nigeria",
      "role": "customer",
      "isVerified": true,
      "status": "active",
      "profilePicture": "avatar.jpg",
      "createdAt": "2025-01-15T08:00:00.000Z",
      "updatedAt": "2025-06-10T12:00:00.000Z",
      "KycStateTwo": {
        "id": 1,
        "userId": 50,
        "bvn": "12345678901",
        "surName": "Doe",
        "firtName": "John",
        "dob": "1990-05-15",
        "status": "verified",
        "state": "verified"
      },
      "inappNotification": [
        { "id": 1, "title": "Welcome", "description": "Welcome to Terescrow", "type": "info", "createdAt": "..." }
      ],
      "AccountActivity": [
        { "id": 1, "userId": 50, "description": "Logged in from Lagos", "createdAt": "..." }
      ]
    }
  ]
}
```

**Table columns used:** firstname, lastname, username, email, phoneNumber, country, gender, KycStateTwo.state (for verified/pending/failed badge), status (for block/unblock).

#### GET `/api/admin/operations/get-customer-stats`

Response:

```json
{
  "data": {
    "totalCustomers":     { "count": 1500, "change": "positive", "percentage": 12 },
    "verifiedCustomers":  { "count": 1200, "change": "positive", "percentage": 10 },
    "offlineNow":         { "count": 300,  "change": "negative", "percentage": 2 },
    "totalCustomerChats": { "count": 5000, "change": "positive", "percentage": 8 }
  }
}
```

---

### A5. Customer Detail

**Page:** `/customers/:id`

#### GET `/api/admin/operations/get-customer-details/:id`

Response: Single Customer object (same shape as in A4 list, plus nested arrays).

**Fields displayed:**
- **Profile:** firstname, lastname, username, profilePicture
- **Contact:** email, phoneNumber, gender, country
- **KYC:** KycStateTwo (bvn, surName, firtName, dob, state)
- **Account Activity:** AccountActivity[] (description, createdAt)
- **Wallet:** nairaBalance, cryptoBalance (see Section C for missing fields)

#### GET `/api/agent/utilities/get-notes/:customerId`

Response:

```json
{
  "data": [
    { "id": 1, "note": "Customer requested refund", "createdAt": "...", "agent": { "username": "agent_smith" } }
  ]
}
```

#### POST `/api/agent/utilities/create-note`

Body: `{ "note": "...", "userId": 50 }`

#### POST `/api/admin/operations/update-kycstatus/:userId`

Body: `{ "kycStatus": "verified", "reason": "Documents verified" }`

#### POST `/api/admin/operations/update-customer/:id`

Body: customer fields to update (firstname, lastname, email, phoneNumber, gender, country, etc.)

---

### A6. Chats

**Page:** `/chats`

#### GET `/api/admin/operations/get-all-agent-to-customer-chats`

Query params: `page`, `limit`, `status?`, `type?`, `category?`, `q?` (search), `start?` (YYYY-MM-DD), `end?` (YYYY-MM-DD)

Response:

```json
{
  "success": true,
  "message": "...",
  "data": [
    {
      "id": "chat-123",
      "updatedAt": "...",
      "createdAt": "...",
      "chatStatus": "pending",
      "department": { "id": "1", "title": "Buy Crypto", "Type": "buy", "niche": "crypto" },
      "category": { "id": "10", "title": "Bitcoin" },
      "customer": {
        "id": "50", "username": "john_doe", "firstname": "John", "lastname": "Doe",
        "profilePicture": "avatar.jpg", "country": "Nigeria"
      },
      "agent": {
        "id": "5", "username": "agent_smith", "firstname": "Agent", "lastname": "Smith",
        "profilePicture": "agent.jpg"
      },
      "recentMessage": { "id": "msg-1", "message": "Hello, I need help", "createdAt": "..." },
      "unreadCount": 3,
      "transactionsCount": 2
    }
  ],
  "page": 1,
  "limit": 50,
  "total": 200,
  "totalPages": 4
}
```

#### GET `/api/admin/operations/get-chat-stats`

Response:

```json
{
  "data": {
    "totalChats":              { "count": 5000, "change": "positive", "percentage": 8 },
    "unsuccessfulChats":       { "count": 200,  "change": "negative", "percentage": 2 },
    "successfulTransactions":  { "count": 3500, "change": "positive", "percentage": 10 },
    "pendingChats":            { "count": 800,  "change": "positive", "percentage": 5 },
    "declinedChats":           { "count": 500,  "change": "negative", "percentage": 3 }
  }
}
```

#### GET `/api/admin/operations/get-agent-customer-chatdetails/:chatId`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "id": 123,
    "customer": { "id": 50, "username": "john_doe", "firstname": "John", "lastname": "Doe", "profilePicture": "...", "role": "customer" },
    "agent": { "id": 5, "username": "agent_smith", "firstname": "Agent", "lastname": "Smith", "profilePicture": "...", "role": "agent" },
    "messages": [
      {
        "id": 1, "senderId": 50, "receiverId": 5, "chatId": 123,
        "message": "Hello, I need help", "image": null,
        "isRead": true, "createdAt": "...", "updatedAt": "..."
      }
    ],
    "chatDetails": {
      "id": 1, "chatId": 123, "departmentId": 1, "categoryId": 10,
      "status": "pending", "createdAt": "...", "updatedAt": "...",
      "category": { "id": 10, "title": "Bitcoin", "subTitle": "BTC", "image": "...", "status": "active", "createdAt": "...", "updatedAt": "..." },
      "department": { "id": 1, "title": "Buy Crypto", "description": "...", "icon": "...", "createdAt": "...", "updatedAt": "...", "status": "active", "Type": "buy", "niche": "crypto" }
    },
    "chatType": "customer",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

#### POST `/api/agent/send-to-customer`

Body: FormData with `chatId`, `message`, optional `image` (file)

Response:

```json
{
  "data": {
    "id": 999, "createdAt": "...", "updatedAt": "...", "chatId": 123,
    "message": "Hello!", "senderId": 5, "receiverId": 50, "isRead": false, "image": null
  }
}
```

#### POST `/api/agent/change-chat-status`

Body: `{ "chatId": 123, "status": "successful" }`

---

### A7. Other Existing Endpoints

| Page | Method | Endpoint | Notes |
|------|--------|----------|-------|
| Rates | GET | `/api/admin/operations/get-rate` | Returns `{ data: Rate[] }` with createdAt, rate, agent, amount, amountNaira |
| Departments list | GET | `/api/admin/operations/get-all-department` | Array of departments |
| Create department | POST | `/api/admin/operations/create-department` | FormData: title, description, status, Type, niche, icon |
| Update department | POST | `/api/admin/operations/update-department` | Same fields |
| Delete department | POST | `/api/admin/operations/delete-department` | Department id |
| Single department | GET | `/api/admin/operations/get-department/:id` | Single department object |
| Categories (Services) | GET | `/api/admin/operations/get-all-categories` | Array of categories |
| Single category | GET | `/api/admin/operations/get-single-category/:id` | Single category |
| Create category | POST | `/api/admin/operations/create-category` | FormData |
| Update category | POST | `/api/admin/operations/update-category` | FormData |
| Delete category | POST | `/api/admin/operations/delete-category` | Category id |
| Subcategories | GET | `/api/admin/operations/get-all-subcategories` | Array |
| Create subcategory | POST | `/api/admin/operations/create-subcategory` | FormData |
| Update subcategory | POST | `/api/admin/operations/update-subcategory` | FormData |
| Teams | GET | `/api/admin/operations/get-team-members-2` | Team members list |
| Team stats | GET | `/api/admin/operations/get-team-stats` | totalAgents, totalOnlineAgents, totalOfflineAgents |
| All agents | GET | `/api/admin/operations/get-all-agents` | Agents list |
| Agent by dept | GET | `/api/admin/operations/get-agent-by-department` | Filtered agents |
| KYC requests | GET | `/api/admin/operations/kyc-users` | Customer list with KYC data |
| KYC limits | GET | `/api/admin/operations/get-kyc-limits` | `[{ id, tier, cryptoSellLimit, cryptoBuyLimit, giftCardSellLimit, giftCardBuyLimit }]` |
| SMTP get | GET | `/api/admin/operations/get-smtp` | `{ data: { host, from, email, port, password, encryption } }` |
| SMTP create | POST | `/api/admin/operations/create-smtp` | Same fields as body |
| Quick replies list | GET | `/api/agent/utilities/get-all-quick-replies` | `{ data: [{ id, message, userId, createdAt }] }` |
| Create quick reply | POST | `/api/agent/utilities/create-quick-reply` | `{ message }` |
| Update quick reply | PUT | `/api/agent/utilities/update-quick-reply` | `{ id, message }` |
| Delete quick reply | DELETE | `/api/agent/utilities/delete-quick-reply` | `{ id }` |
| Ways of hearing | GET | `/api/admin/operations/get-all-ways-of-hearing` | `{ data: { grouped: [{ name, count }], list: [{ id, title }] } }` |
| Create way | POST | `/api/admin/operations/create-ways-of-hearing` | `{ means }` |
| Team notifications | GET | `/api/agent/utilities/get-team-notifications` | `{ data: [{ description, createdAt }] }` |
| Customer notifications | GET | `/api/agent/utilities/get-customer-notifications` | `{ data: [{ description, createdAt }] }` |
| All notifications | GET | `/api/admin/operations/get-all-notifications` | Notification list |
| Create notification | POST | `/api/admin/operations/create-notification` | Notification fields |
| Delete notification | POST | `/api/admin/operations/delete-notification` | Notification id |
| Banners list | GET | `/api/admin/operations/get-all-banners` | Banner list |
| Create banner | POST | `/api/admin/operations/create-banner` | FormData with image |
| Delete banner | POST | `/api/admin/operations/delete-banner` | Banner id |
| Create role | POST | `/api/admin/operations/create-role` | `{ name }` |
| Roles list | GET | `/api/admin/operations/get-roles-list` | Roles array |
| Block/Unblock | POST | `/api/admin/operations/change-status` | `{ id, status: "active" or "block" }` |
| Create agent | POST | `/api/admin/create-agent` | Agent fields |
| Create team member | POST | `/api/admin/create-team-member` | Team member fields |
| Update agent | POST | `/api/admin/operations/update-agent` | Agent fields |
| User activity | GET | `/api/admin/operations/get-user-activity` | Activity list |
| All users | GET | `/api/admin/operations/get-all-users` | Users list |
| Pending chats | GET | `/api/agent/utilities/get-all-default-chats` | Default/pending chat list |
| Take over chat | POST | `/api/agent/utilities/take-over-chat` | Chat id |
| Unread count | GET | `/api/public/get-unread-count` | `{ data: { count } }` |
| Mark all read | POST | `/api/public/mark-all-messages-read` | — |
| Login | POST | `/api/agent/auth/login` | `{ email, password }` → token + user data |
| Change password | POST | `/api/auth/change-password` | Password fields |

---

## Section B: New Admin Endpoints (NEED TO BE BUILT)

All endpoints below use base `/api/admin`. All return the standard envelope: `{ "status": "success", "message": "...", "data": { ... } }`.

---

### B1. User Balances

**Page:** `/user-balances`

#### GET `/api/admin/user-balances`

Query params:
- `sort?` (string, e.g. "name-az", "total-balance-desc")
- `startDate?` (YYYY-MM-DD)
- `endDate?` (YYYY-MM-DD)
- `dateRange?` (string, e.g. "Last 30 days")
- `search?` (string)
- `page` (number, default 1)
- `limit` (number, default 20)

Response:

```json
{
  "status": "success",
  "message": "User balances retrieved",
  "data": {
    "rows": [
      {
        "id": 50,
        "name": "John Doe",
        "email": "john@example.com",
        "totalBalanceUsd": 5000,
        "totalBalanceN": 20005000,
        "cryptoBalanceUsd": 250,
        "cryptoBalanceN": 200000,
        "nairaBalance": 500000
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

Notes: All balance fields are **numbers**. Frontend formats with `$`/`N` prefix and thousand separators.

---

### B2. Master Wallet

**Page:** `/master-wallet`

#### GET `/api/admin/master-wallet/balances/summary`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "summary": [
      {
        "walletId": "tercescrow",
        "label": "Tercescrow Master Wallet",
        "totalUsd": 50000,
        "totalNgn": 20000000000,
        "totalBtc": 10
      },
      {
        "walletId": "yellowcard",
        "label": "Yellow Card Wallet",
        "totalUsd": 25000,
        "totalNgn": 10000000000,
        "totalBtc": 5
      },
      {
        "walletId": "palmpay",
        "label": "Palmpay Wallet",
        "totalUsd": 30000,
        "totalNgn": 5000000,
        "accountName": "Tercescrow",
        "accountNumber": "0123453234"
      }
    ]
  }
}
```

Notes:
- `walletId` must be one of: `"tercescrow"`, `"yellowcard"`, `"palmpay"`.
- `totalBtc` is optional (only for crypto wallets).
- `accountName` and `accountNumber` are only for Palmpay.

#### GET `/api/admin/master-wallet/assets`

Query params: `walletId?` (string)

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "assets": [
      {
        "symbol": "BTC",
        "name": "Bitcoin",
        "balance": "10 BTC",
        "usdValue": "$10,000,000",
        "masterBalance": "10 BTC",
        "masterUsd": "$10,000,000",
        "yellowCard": "5 BTC",
        "yellowCardUsd": "$5,000,000",
        "tatum": "5 BTC",
        "tatumUsd": "$5,000,000",
        "tercescrowBalance": "10 BTC",
        "tercescrowUsd": "$10,000,000",
        "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
      }
    ]
  }
}
```

#### GET `/api/admin/master-wallet/transactions`

Query params: `walletId?`, `assetSymbol?`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "transactions": [
      {
        "id": "tx-001",
        "to": "0xabc...",
        "status": "successful",
        "type": "Send",
        "wallet": "tercescrow",
        "amount": "0.5 BTC",
        "date": "Nov 6, 2024",
        "assetSymbol": "BTC",
        "walletId": "tercescrow"
      }
    ]
  }
}
```

#### POST `/api/admin/master-wallet/send`

Body:

```json
{
  "address": "0xabc...",
  "amountCrypto": "0.5",
  "amountDollar": "25000",
  "network": "Ethereum",
  "symbol": "ETH",
  "vendorId": 1
}
```

Response: `{ "data": { "success": true, "txId": 123 } }`

#### POST `/api/admin/master-wallet/swap`

Body:

```json
{
  "fromSymbol": "ETH",
  "toSymbol": "USDC",
  "fromAmount": "0.5",
  "toAmount": "1000",
  "receivingWallet": "Master Wallet"
}
```

Response: `{ "data": { "success": true, "txId": 456 } }`

---

### B3. Vendors

**Page:** `/settings/vendors` and used in Master Wallet Send modal

#### GET `/api/admin/vendors`

Query params: `currency?` (optional, filter by currency for Send modal)

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": [
    {
      "id": 1,
      "name": "Yellow Card Withdrawal",
      "network": "Ethereum",
      "currency": "USDT",
      "walletAddress": "0xabc123...",
      "notes": "Primary USDT payout",
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-06-01T00:00:00.000Z"
    }
  ]
}
```

Notes: `id` is a **number** (not string). Frontend uses numeric id for update/delete.

#### POST `/api/admin/vendors`

Body:

```json
{ "name": "...", "network": "Ethereum", "currency": "USDT", "walletAddress": "0x...", "notes": "..." }
```

Response: `{ "data": { "id": 2, "name": "...", ... } }`

#### PATCH `/api/admin/vendors/:id`

Body: Partial vendor fields.

Response: `{ "data": { updated vendor object } }`

#### DELETE `/api/admin/vendors/:id`

Response: `{ "status": "success", "message": "Vendor deleted" }`

---

### B4. Daily Report

**Page:** `/daily-report`

#### GET `/api/admin/daily-report/shift-settings`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "day": { "checkIn": "09:00", "checkOut": "17:00", "gracePeriod": 15 },
    "night": { "checkIn": "22:00", "checkOut": "06:00", "gracePeriod": 15 }
  }
}
```

Notes: `gracePeriod` can be a number (minutes) or string (`"00:15"`). Frontend normalizes both.

#### PUT `/api/admin/daily-report/shift-settings`

Body: Same shape as response data.

Response: `{ "data": { updated settings } }`

#### GET `/api/admin/daily-report/logs`

Query params: `startDate?`, `endDate?`, `shift?` (Day/Night), `agentId?`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "logs": [
      {
        "id": "1",
        "employeeId": 5,
        "employeeName": "Qamardeen",
        "day": "Monday",
        "shift": "Day",
        "date": "10/06/25",
        "checkInTime": "08:55 AM",
        "checkOutTime": "04:30 PM",
        "status": "On time",
        "amountMade": "$11234/N250000",
        "reportPreview": "I have something to...",
        "reportId": "r1"
      }
    ]
  }
}
```

#### GET `/api/admin/daily-report/summary`

Query params: `agentId?`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "activeHours": "160 hrs",
    "activeHoursTrend": "+10%",
    "amountEarned": "$50,000",
    "department": "Crypto"
  }
}
```

#### GET `/api/admin/daily-report/charts/avg-work-hours`

Query params: `days` (default 7)

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "data": [
      { "day": "Mon", "hours": 8 },
      { "day": "Tue", "hours": 10 },
      { "day": "Wed", "hours": 7 },
      { "day": "Thu", "hours": 9 },
      { "day": "Fri", "hours": 8 },
      { "day": "Sat", "hours": 6 },
      { "day": "Sun", "hours": 4 }
    ]
  }
}
```

#### GET `/api/admin/daily-report/charts/work-hours-per-month`

Query params: `months` (default 3)

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "data": [
      { "month": "Jan", "workHrs": 160, "overTimeHrs": 20 },
      { "month": "Feb", "workHrs": 150, "overTimeHrs": 15 },
      { "month": "Mar", "workHrs": 170, "overTimeHrs": 25 }
    ]
  }
}
```

#### GET `/api/admin/daily-report/reports/:reportId`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "id": "r1",
    "date": "October 8, 2025",
    "agentName": "Qamardeen",
    "position": "Senior Agent",
    "shift": "Day",
    "auditorName": "Admin",
    "clockInTime": "08:55 AM",
    "clockOutTime": "04:30 PM",
    "activeHours": "7h 35m",
    "totalChatSessions": 45,
    "avgResponseTimeSec": 30,
    "giftCard": { "purchaseAmt": "N500,000", "salesAmt": "N450,000", "profit": "N50,000" },
    "crypto": { "openingBalance": "$10,000", "closingBalance": "$12,000", "profit": "$2,000" },
    "billPayments": { "openingBalance": "N100,000", "closingBalance": "N95,000", "profit": "N5,000" },
    "chat": { "successful": 40, "pending": 3, "unsuccessful": 2, "totalProfit": "N200,000" },
    "financials": { "earnPayout": "N50,000", "openingBalance": "N1,000,000", "closingBalance": "N1,200,000", "totalProfit": "N200,000" },
    "status": "approved",
    "myReport": "Handled 45 sessions today...",
    "auditorsReport": "Performance within target..."
  }
}
```

#### PATCH `/api/admin/daily-report/reports/:reportId`

Body: `{ "status": "approved", "auditorsReport": "...", "myReport": "..." }` (all optional)

#### POST `/api/admin/daily-report/check-in`

Body: `{ "shift": "Day", "timestamp": "2025-10-08T09:00:00.000Z" }` (timestamp optional)

#### POST `/api/admin/daily-report/check-out`

Body: `{ "timestamp": "2025-10-08T17:00:00.000Z" }` (optional)

---

### B5. Transaction Tracking

**Page:** `/transaction-tracking`

#### GET `/api/admin/transaction-tracking`

Query params: `txType?` (Send/Receive/Buy/Sell/Swap), `startDate?`, `endDate?`, `search?`, `page?`, `limit?`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "items": [
      {
        "id": "1",
        "name": "Qamar Malik",
        "status": "Successful",
        "txId": "sbsjqb8h2discbqies",
        "type": "Local",
        "amount": "$11234/N250000",
        "date": "Nov 6, 2024"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

Notes: `status` is `"Successful"`, `"Pending"`, or `"Failed"`.

#### GET `/api/admin/transaction-tracking/:txId/steps`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "steps": [
      {
        "title": "Step 1 - Initiation",
        "crypto": "Bitcoin",
        "network": "Bitcoin Network",
        "route": "Direct",
        "action": "Buy",
        "date": "Nov 6, 2024 10:30 AM",
        "fromAddress": "bc1q...",
        "toAddress": "bc1q...",
        "transactionHash": "0xabc123...",
        "status": "Successful"
      }
    ]
  }
}
```

#### GET `/api/admin/transaction-tracking/:txId/details`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "amountDollar": "$11,234",
    "amountNaira": "N250,000",
    "serviceType": "Buy Crypto",
    "cryptoType": "Bitcoin",
    "cryptoChain": "Bitcoin Network",
    "cryptoAmount": "0.5 BTC",
    "sendAddress": "bc1q...",
    "receiverAddress": "bc1q...",
    "transactionHash": "0xabc123...",
    "transactionId": "sbsjqb8h2discbqies",
    "transactionStatus": "Successful"
  }
}
```

#### POST `/api/admin/transaction-tracking/:txId/send-to-vendor`

On-chain send **from the customer deposit address** to the vendor’s `walletAddress`; persists **`ReceivedAssetDisbursement`**. **Not** `POST /api/admin/master-wallet/send` (different signing keys and `master_wallet_transactions`).

**`:txId`** = `CryptoTransaction.transactionId` (e.g. `RECEIVE-…`).

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `vendorId` | number | Yes | `Vendor` primary key |
| `amount` | string | No | Omit or empty → server uses **full** `CryptoReceive` amount. If set, must equal that full amount. |

**Response `data` (example):**

```json
{
  "disbursementId": 0,
  "txHash": "",
  "amount": "",
  "amountUsd": "",
  "toAddress": "",
  "vendorId": 0,
  "networkFee": "",
  "gasFundingTxHash": ""
}
```

**`GET …/details`** should include optional **`disbursements`** (array) for admin UI history.

#### POST `/api/admin/transaction-tracking/:txId/send-to-master-wallet`

On-chain send **from the customer deposit address** to the platform **`MasterWallet.address`** for `normalizeBlockchain(tx.blockchain)` (e.g. `ethereum`, `bsc`, `tron`, `polygon`, `bitcoin`). Persists **`ReceivedAssetDisbursement`** with **`disbursementType: 'master_wallet'`**, **`vendorId: null`**. Same executors / success path as vendor disbursement: **`ReceivedAsset.status` → `transferredToMaster`**. **Not** `POST /api/admin/master-wallet/send`.

**Operational:** `MasterWallet.blockchain` must match the normalized chain string used for receives (same as `wallet_currencies.blockchain` / `normalizeBlockchain`). If missing or mismatched, return a clear **not configured** error.

**`:txId`** = `CryptoTransaction.transactionId` (e.g. `RECEIVE-…`).

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | string | No | Omit or empty → server uses **full** `CryptoReceive` amount. If set, must equal that full amount (same rule as vendor). |

**Response `data`:** Same shape as vendor send except no `vendorId` — e.g. `disbursementId`, `txHash`, `amount`, `amountUsd`, `toAddress`, `networkFee`, `gasFundingTxHash`.

**Timeline:** `GET …/:txId/steps` should label **`master_wallet`** disbursements explicitly in step titles/descriptions (see `transaction.tracking.service.ts` on the backend).

#### POST `/api/admin/transaction-tracking/bulk-send-to-vendor`

**Body:** `{ "items": [ { "receiveTransactionId": "RECEIVE-…", "vendorId": 1 }, … ] }` — max **100** items; each row uses the full receive amount for that `receiveTransactionId`.

**Response `data`:** `{ "results": [ { "receiveTransactionId", "success", "data?", "error?", "statusCode?" } ], "summary": { "total", "succeeded", "failed" } }`

---

### B6. Referrals

**Page:** `/referrals`

#### GET `/api/admin/referrals/summary`

Query params: `startDate?`, `endDate?`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "allUsers": 150,
    "allUsersTrend": "+15%",
    "totalReferred": 100,
    "amountPaidOut": "N80,000"
  }
}
```

#### GET `/api/admin/referrals`

Query params: `type?`, `search?`, `startDate?`, `endDate?`, `page?`, `limit?`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "rows": [
      {
        "id": 1,
        "name": "Qamardeen Abdulmalik",
        "email": "qamar@gmail.com",
        "joined": "Nov 7, 2024",
        "noOfReferrals": 10,
        "downlineReferrals": 24,
        "amountEarned": "N10,000"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

Notes: Each row MUST include a numeric `id` (or `userId`). Frontend uses this for the by-user drill-down.

#### GET `/api/admin/referrals/by-user/:userId`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "referrals": [
      {
        "referredName": "Chris Adewale",
        "referredAt": "June 16, 2025 - 07:22 AM",
        "stats": {
          "giftCardBuy": "N10,000",
          "giftCardSell": "N20,000",
          "cryptoTrades": "N20,000",
          "noOfUsersReferred": 10
        },
        "earned": {
          "amountEarnedFromTrades": "N20,000",
          "fromGcTrades": "N10,000",
          "fromCryptoTrades": "N10,000",
          "fromDownlines": "N20,000"
        }
      }
    ]
  }
}
```

#### GET `/api/admin/referrals/earn-settings`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "firstTimeDepositBonusPct": 100,
    "commissionReferralTradesPct": 5,
    "commissionDownlineTradesPct": 2
  }
}
```

#### PUT `/api/admin/referrals/earn-settings`

Body:

```json
{
  "firstTimeDepositBonusPct": 100,
  "commissionReferralTradesPct": 5,
  "commissionDownlineTradesPct": 2
}
```

---

### B7. Support

**Page:** `/support`

#### GET `/api/admin/support/chats`

Query params:
- `filter?`: `"processing"` (Active tab), `"completed"` (Closed tab), `"unread"` (Unread tab), or omit for All
- `search?` (string)
- `page?`, `limit?`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "chats": [
      {
        "id": "chat-1",
        "participantName": "Adewale",
        "lastMessage": "Dave: I have attended to the user",
        "lastMessageTime": "2025-06-16T10:00:00.000Z",
        "unreadCount": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

Notes: `lastMessageTime` is ISO8601. Frontend formats to locale time (e.g. "10:00 am").

#### GET `/api/admin/support/chats/:chatId/messages`

Query params: `before?` (ISO timestamp for pagination), `limit?`

Response:

```json
{
  "status": "success",
  "message": "...",
  "data": {
    "messages": [
      {
        "id": "m1",
        "sender": "user",
        "text": "I need help with bill payments",
        "time": "2025-06-16T10:00:00.000Z"
      },
      {
        "id": "m2",
        "sender": "agent",
        "text": "Hello, how can we help you",
        "time": "2025-06-16T10:01:00.000Z"
      }
    ]
  }
}
```

Notes: `sender` is `"user"` or `"agent"`. `time` is ISO8601.

#### POST `/api/admin/support/chats/:chatId/messages`

Body: `{ "text": "Hello!" }` or FormData with `text` + `image` file

Response: `{ "data": { "id": "m3", "sender": "agent", "text": "Hello!", "time": "..." } }`

#### PATCH `/api/admin/support/chats/:chatId`

Body: `{ "status": "completed", "markRead": true }` (both optional)

---

### B8. Customer Freeze/Ban

Used from the customer table action menu.

#### POST `/api/admin/customers/:customerId/freeze`

Body: `{ "feature": "withdrawal" }`

Response: `{ "data": { "frozenFeatures": ["withdrawal"] } }`

#### POST `/api/admin/customers/:customerId/unfreeze`

Body: `{ "feature": "withdrawal" }`

Response: `{ "data": { "frozenFeatures": [] } }`

#### POST `/api/admin/customers/:customerId/ban`

Body: `{ "reason": "Fraud suspected", "permanent": true }`

Response: `{ "data": { "status": "banned" } }`

---

### B9. Transactions (NEW — Replaces old gift-card-sale-only endpoints)

> **Background:** The old `GET /api/admin/operations/get-all-transactions` only returns gift card sale transactions. The frontend needs endpoints that return ALL transaction types (crypto, gift card buy, gift card sell, bill payments, naira) with their type-specific fields.

**Pages:** `/transactions` (All tab), `/transactions/crypto`, `/transactions/gift-card-buy`, `/transactions/bill-payments`, `/transactions/naira`, `/transaction-details/:customerId`

#### B9.1 GET `/api/admin/transactions`

Returns all transactions across all types. Supports server-side filtering so frontend doesn't have to fetch everything and filter client-side.

Query params:
- `niche?` — Filter by transaction category: `"crypto"`, `"giftcard"`, `"billpayment"`, `"naira"`. Omit for all.
- `type?` — Filter by buy/sell: `"buy"`, `"sell"`. Omit for all.
- `status?` — Filter by status: `"successful"`, `"pending"`, `"declined"`. Omit for all.
- `search?` — Search by customer name, username, category title, transaction ID.
- `startDate?` — ISO date (YYYY-MM-DD). Filter transactions created on or after this date.
- `endDate?` — ISO date (YYYY-MM-DD). Filter transactions created on or before this date.
- `page?` — Page number (default 1).
- `limit?` — Items per page (default 20).

Response:

```json
{
  "status": "success",
  "message": "Transactions retrieved",
  "data": {
    "transactions": [
      {
        "id": 123,
        "transactionId": "TXN-ABC123",
        "status": "successful",
        "amount": 250.00,
        "amountNaira": 100000,
        "createdAt": "2025-11-06T10:30:00.000Z",
        "updatedAt": "2025-11-06T10:35:00.000Z",
        "profit": 15.50,
        "department": {
          "id": 1,
          "title": "Buy Crypto",
          "niche": "crypto",
          "Type": "buy"
        },
        "category": {
          "id": 10,
          "title": "Bitcoin",
          "subTitle": "BTC",
          "image": "btc.png"
        },
        "subCategory": {
          "id": 100,
          "title": "Buy BTC with Naira"
        },
        "customer": {
          "id": 50,
          "username": "john_doe",
          "firstname": "John",
          "lastname": "Doe",
          "profilePicture": "avatar.jpg",
          "country": "Nigeria"
        },
        "agent": {
          "id": 5,
          "username": "agent_smith",
          "firstname": "Agent",
          "lastname": "Smith",
          "profilePicture": "agent.jpg"
        },

        "fromAddress": "0xabc...",
        "toAddress": "0xdef...",
        "cardType": null,
        "cardNumber": null,
        "giftCardSubType": null,
        "billType": null,
        "billReference": null,
        "billProvider": null,
        "nairaType": null,
        "nairaChannel": null,
        "nairaReference": null
      }
    ],
    "total": 500,
    "page": 1,
    "limit": 20,
    "totalPages": 25
  }
}
```

**Important:** Every transaction object MUST include ALL type-specific fields (set to `null` when not applicable for that niche). This lets the frontend render the correct detail modal sections based on which fields are non-null. The `department.niche` field determines which tab a transaction belongs to.

**Frontend usage per page:**
| Page route | Query sent |
|---|---|
| `/transactions` (All tab) | No `niche` param — returns all types |
| `/transactions/crypto` | `niche=crypto` |
| `/transactions/gift-card-buy` | `niche=giftcard&type=buy` |
| `/transactions` Gift Cards tab | `niche=giftcard` (both buy and sell) |
| `/transactions/bill-payments` | `niche=billpayment` |
| `/transactions/naira` | `niche=naira` |

---

#### B9.2 GET `/api/admin/transactions/by-customer/:customerId`

Returns all transactions for a specific customer across ALL niches. Same response shape and query params as B9.1, but scoped to one customer.

Query params: same as B9.1 (`niche?`, `type?`, `status?`, `search?`, `startDate?`, `endDate?`, `page?`, `limit?`)

Response: Same shape as B9.1.

**Frontend usage:** The `/transaction-details/:customerId` page calls this. It has the same All / Gift Cards / Crypto / Bill Payments / Naira tabs.

---

#### B9.3 GET `/api/admin/transactions/stats`

Updated stats endpoint that covers ALL transaction types (not just crypto and gift cards).

Query params:
- `niche?` — If provided, returns stats for only that niche. Omit for overall stats.
- `startDate?`, `endDate?` — Date range for stats.

Response:

```json
{
  "status": "success",
  "message": "Transaction stats retrieved",
  "data": {
    "totalTransactions": {
      "count": 8200,
      "change": "positive",
      "percentage": 8
    },
    "totalTransactionAmountSum": {
      "_sum": { "amount": 500000, "amountNaira": 200000000 },
      "change": "positive",
      "percentage": 12
    },
    "cryptoTransactions": {
      "_count": 3000,
      "_sum": { "amount": 250000, "amountNaira": 100000000 },
      "change": "positive",
      "percentage": 10
    },
    "giftCardTransactions": {
      "_count": 2000,
      "_sum": { "amount": 150000, "amountNaira": 60000000 },
      "change": "positive",
      "percentage": 5
    },
    "billPaymentTransactions": {
      "_count": 1500,
      "_sum": { "amount": 50000, "amountNaira": 20000000 },
      "change": "positive",
      "percentage": 3
    },
    "nairaTransactions": {
      "_count": 1700,
      "_sum": { "amount": 0, "amountNaira": 80000000 },
      "change": "positive",
      "percentage": 7
    }
  }
}
```

Notes:
- `billPaymentTransactions` and `nairaTransactions` are **new** — the old stats endpoint didn't include them.
- For naira transactions, `_sum.amount` (USD) may be 0 if they are purely naira-denominated.

---

#### B9.4 Summary: What changes for the old endpoints

| Old Endpoint | Current Behavior | What To Do |
|---|---|---|
| `GET /api/admin/operations/get-all-transactions` | Returns gift card sale only | **Keep as-is** for backward compat. Frontend will migrate to `GET /api/admin/transactions`. |
| `GET /api/admin/operations/get-customer-transactions/:id` | Returns gift card sale only for one customer | **Keep as-is**. Frontend will migrate to `GET /api/admin/transactions/by-customer/:customerId`. |
| `GET /api/admin/operations/get-transaction-stats` | Returns only crypto + gift card stats | **Either update** to add `billPaymentTransactions` + `nairaTransactions`, or frontend will migrate to `GET /api/admin/transactions/stats`. |

---

## Section C: Missing Fields on Existing Endpoints

These fields are needed by the UI but the existing customer detail endpoint may not return them. Backend should add these to `GET /api/admin/operations/get-customer-details/:id`:

| Field | Type | Description | Current fallback in UI |
|-------|------|-------------|----------------------|
| `ipAddress` | string | Customer's last known IP | "123.123.345.99" |
| `tier` | string | KYC tier level | "Tier 2" |
| `nairaBalance` | number or string | Naira wallet balance | "N200,000" |
| `cryptoBalance` | number or string | Crypto portfolio value in USD | "$25" |
| `referralCode` | string | Customer's referral code | "none" |
| `cryptoAssets` | array (optional) | Per-asset breakdown for wallet modal: `[{ symbol, name, balance, usdEquivalent }]` | Not shown |

---

## Quick Reference: All New Endpoints to Build

| # | Method | Path | Page |
|---|--------|------|------|
| 1 | GET | `/api/admin/user-balances` | User Balances |
| 2 | GET | `/api/admin/master-wallet/balances/summary` | Master Wallet |
| 3 | GET | `/api/admin/master-wallet/assets` | Master Wallet |
| 4 | GET | `/api/admin/master-wallet/transactions` | Master Wallet |
| 5 | POST | `/api/admin/master-wallet/send` | Master Wallet |
| 6 | POST | `/api/admin/master-wallet/swap` | Master Wallet |
| 7 | GET | `/api/admin/vendors` | Settings + Master Wallet |
| 8 | POST | `/api/admin/vendors` | Settings |
| 9 | PATCH | `/api/admin/vendors/:id` | Settings |
| 10 | DELETE | `/api/admin/vendors/:id` | Settings |
| 11 | GET | `/api/admin/daily-report/shift-settings` | Daily Report |
| 12 | PUT | `/api/admin/daily-report/shift-settings` | Daily Report |
| 13 | GET | `/api/admin/daily-report/logs` | Daily Report |
| 14 | GET | `/api/admin/daily-report/summary` | Daily Report |
| 15 | GET | `/api/admin/daily-report/charts/avg-work-hours` | Daily Report |
| 16 | GET | `/api/admin/daily-report/charts/work-hours-per-month` | Daily Report |
| 17 | GET | `/api/admin/daily-report/reports/:reportId` | Daily Report |
| 18 | PATCH | `/api/admin/daily-report/reports/:reportId` | Daily Report |
| 19 | POST | `/api/admin/daily-report/check-in` | Daily Report |
| 20 | POST | `/api/admin/daily-report/check-out` | Daily Report |
| 21 | GET | `/api/admin/transaction-tracking` | Transaction Tracking |
| 22 | GET | `/api/admin/transaction-tracking/:txId/steps` | Transaction Tracking |
| 23 | GET | `/api/admin/transaction-tracking/:txId/details` | Transaction Tracking |
| 24 | GET | `/api/admin/referrals/summary` | Referrals |
| 25 | GET | `/api/admin/referrals` | Referrals |
| 26 | GET | `/api/admin/referrals/by-user/:userId` | Referrals |
| 27 | GET | `/api/admin/referrals/earn-settings` | Referrals |
| 28 | PUT | `/api/admin/referrals/earn-settings` | Referrals |
| 29 | GET | `/api/admin/support/chats` | Support |
| 30 | GET | `/api/admin/support/chats/:chatId/messages` | Support |
| 31 | POST | `/api/admin/support/chats/:chatId/messages` | Support |
| 32 | PATCH | `/api/admin/support/chats/:chatId` | Support |
| 33 | POST | `/api/admin/customers/:id/freeze` | Customer Table |
| 34 | POST | `/api/admin/customers/:id/unfreeze` | Customer Table |
| 35 | POST | `/api/admin/customers/:id/ban` | Customer Table |
| 36 | GET | `/api/admin/transactions` | Transactions (all types) |
| 37 | GET | `/api/admin/transactions/by-customer/:customerId` | Customer Transaction Details (all types) |
| 38 | GET | `/api/admin/transactions/stats` | Transaction Stats (all types incl. bill payment + naira) |
| 39 | POST | `/api/admin/transaction-tracking/:txId/send-to-vendor` | Transaction Tracking (deposit → vendor) |
| 40 | POST | `/api/admin/transaction-tracking/bulk-send-to-vendor` | Transaction Tracking (bulk deposit → vendor) |
| 41 | POST | `/api/admin/transaction-tracking/:txId/send-to-master-wallet` | Transaction Tracking (deposit → master wallet) |
