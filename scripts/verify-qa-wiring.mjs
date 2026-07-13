#!/usr/bin/env node
/**
 * Static verification of QA fix wiring (no live API).
 */
import fs from 'fs';
import path from 'path';

const root = path.join(import.meta.dirname, '..', 'src', 'renderer', 'src');
const checks = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function ok(name, pass, detail = '') {
  checks.push({ name, pass, detail });
}

// Dashboard uses admin transactions API
const dash = read('pages/Dashboard.tsx');
ok('Dashboard: getAdminTransactions', dash.includes('getAdminTransactions'));
ok('Dashboard: resolveDateFilters', dash.includes('resolveDateFilters'));
ok('Dashboard: no legacy getTransactions', !dash.includes('getTransactions({'));

// Online agents
const oa = read('components/TopBar/OnlineAgents.tsx');
ok('OnlineAgents: no hardcoded +3', !oa.includes('+3'));
ok('OnlineAgents: team stats or socket', oa.includes('getTeamStats') || oa.includes('onlineAgents'));

// Customers pagination
const cp = read('pages/CustomersPage.tsx');
ok('CustomersPage: server page', cp.includes('gettAllCustomerss') && cp.includes('page'));
ok('CustomersPage: explicit date inputs only', cp.includes('apiStartDate') && !cp.includes('resolveDateFilters'));

// Freeze features
const ff = read('utils/freezeFeatures.ts');
ok('freezeFeatures: map to API', ff.includes('send/receive/swap/buy/sell crypto'));
const ct = read('components/CustomerTable.tsx');
ok('CustomerTable: toastApiError', ct.includes('toastApiError') || ct.includes('toastSuccess'));

// Transactions
const tx = read('pages/Transaction.tsx');
ok('Transaction: resolveDateFilters', tx.includes('resolveDateFilters'));
ok('Transaction: type param to API', tx.includes("filters.type !== 'All'"));

// KYC table
ok('KycRequestsTable exists', fs.existsSync(path.join(root, 'components/KycRequestsTable.tsx')));
const kyc = read('pages/Kyc.tsx');
ok('Kyc page uses KycRequestsTable', kyc.includes('KycRequestsTable'));

// Crypto jobs
ok('CryptoJobsPage exists', fs.existsSync(path.join(root, 'pages/CryptoJobsPage.tsx')));
const app = read('App.tsx');
ok('App: crypto-jobs route', app.includes('/crypto-jobs'));

// Wallet modal no mock
const wm = read('components/modal/WalletModal.tsx');
ok('WalletModal: no MOCK_CRYPTO', !wm.includes('MOCK_CRYPTO'));

// Asset tx history no MOCK_TXS default
const ath = read('components/modal/AssetTransactionHistoryModal.tsx');
ok('AssetTransactionHistoryModal: no MOCK_TXS', !ath.includes('MOCK_TXS'));

// Utils exist
for (const f of ['utils/dateRange.ts', 'utils/formatLabels.ts', 'utils/freezeFeatures.ts', 'utils/toast.ts']) {
  ok(`exists ${f}`, fs.existsSync(path.join(root, f)));
}

const failed = checks.filter((c) => !c.pass);
console.log('\n=== QA wiring verification ===\n');
for (const c of checks) {
  console.log(c.pass ? '✓' : '✗', c.name, c.detail ? `(${c.detail})` : '');
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) {
  process.exit(1);
}
