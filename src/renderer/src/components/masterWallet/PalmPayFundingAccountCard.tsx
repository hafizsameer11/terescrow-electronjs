import React from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import { PALMPAY_FUNDING_ACCOUNT } from '@renderer/constants/palmpayFundingAccount';
import { toastSuccess } from '@renderer/utils/toast';

function copyText(value: string, label: string) {
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return;
  navigator.clipboard.writeText(value);
  toastSuccess(`${label} copied`);
}

type FieldProps = {
  label: string;
  value: string;
  copyLabel: string;
  mono?: boolean;
};

function Field({ label, value, copyLabel, mono }: FieldProps) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className={`text-sm font-semibold text-gray-900 ${mono ? 'font-mono tracking-wide' : ''}`}>
          {value}
        </p>
        <button
          type="button"
          onClick={() => copyText(value, copyLabel)}
          className="shrink-0 rounded-md p-1.5 text-gray-500 hover:bg-white hover:text-[#147341]"
          title={`Copy ${label.toLowerCase()}`}
        >
          <IoCopyOutline className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

const PalmPayFundingAccountCard: React.FC = () => {
  const { accountNumber, bankName, accountName } = PALMPAY_FUNDING_ACCOUNT;

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">PalmPay Account</h3>
        <p className="mt-1 text-sm text-gray-500">
          Transfer NGN to this account to fund the PalmPay merchant wallet.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Account Number" value={accountNumber} copyLabel="Account number" mono />
        <Field label="Bank Name" value={bankName} copyLabel="Bank name" />
        <Field label="Account Name" value={accountName} copyLabel="Account name" />
      </div>
    </div>
  );
};

export default PalmPayFundingAccountCard;
