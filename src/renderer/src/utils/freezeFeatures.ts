/** UI labels shown in FreezeFeatureModal */
export const FREEZE_FEATURE_UI_OPTIONS = [
  'Deposit',
  'Withdrawal',
  'Send crypto',
  'Receive Crypto',
  'Swap Crypto',
  'Buy Crypto',
  'Sell Crypto',
  'Buy Gift Card',
  'Sell Gift Card',
] as const;

/** Backend ALLOWED_FEATURES in customers.freeze.controller.ts */
const UI_TO_API: Record<string, string> = {
  Deposit: 'deposit',
  Withdrawal: 'withdrawal',
  'Send crypto': 'send/receive/swap/buy/sell crypto',
  'Receive Crypto': 'send/receive/swap/buy/sell crypto',
  'Swap Crypto': 'send/receive/swap/buy/sell crypto',
  'Buy Crypto': 'send/receive/swap/buy/sell crypto',
  'Sell Crypto': 'send/receive/swap/buy/sell crypto',
  'Buy Gift Card': 'buy/sell gift card',
  'Sell Gift Card': 'buy/sell gift card',
};

export const FREEZE_API_FEATURES = [
  'deposit',
  'withdrawal',
  'send/receive/swap/buy/sell crypto',
  'buy/sell gift card',
] as const;

const API_TO_LABEL: Record<string, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  'send/receive/swap/buy/sell crypto': 'Send / Receive / Swap / Buy / Sell Crypto',
  'buy/sell gift card': 'Buy / Sell Gift Card',
};

export function mapFreezeFeatureToApi(uiLabel: string): string {
  const key = uiLabel.toLowerCase().trim();
  if ((FREEZE_API_FEATURES as readonly string[]).includes(key)) return key;
  const mapped = UI_TO_API[uiLabel];
  if (mapped) return mapped;
  return key;
}

export function mapApiFeatureToLabel(apiFeature: string): string {
  const key = apiFeature.toLowerCase().trim();
  return API_TO_LABEL[key] ?? apiFeature;
}

export function parseCustomerId(id: string | number | null | undefined): number | null {
  if (id == null || id === '') return null;
  const n = typeof id === 'number' ? id : parseInt(String(id), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}
