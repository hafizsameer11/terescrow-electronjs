import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubCategories } from '@renderer/api/queries/commonqueries';
import { useAuth } from '@renderer/context/authContext';
import { createCardTransaction, createCryptoTransaction } from '@renderer/api/queries/agent.mutations';
import { ApiError } from '@renderer/api/customApiCall';

const NewTransaction = ({
  type,
  department,
  category,
  subcategories,
  chatId,
  onCompleted,
  onClose,
}: {
  type: string;
  department: any;
  category: any;
  subcategories?: string[];
  chatId: string;
  onCompleted?: () => void;
  onClose?: () => void;
}) => {
  const [modalVisibility, setModalVisible] = useState(true);
  const { token } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    department: department || '', // Non-editable
    category: category || '', // Non-editable
    subcategory: '',
    amount: '',
    exchangeRate: '',
    amountNaira: '',
    cardType: '',
    cardNumber: '',
    cryptoAmount: '',
    fromAddress: '',
    toAddress: '',
    profit: '',
    creditWallet: false,
    walletCreditAmount: '',
  });

  const closeModal = () => {
    setModalVisible(false);
    onClose?.();
  };

  const finishLogged = () => {
    queryClient.invalidateQueries({ queryKey: ['customer-chat-details'] });
    queryClient.invalidateQueries({ queryKey: ['chatDetails'] });
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    queryClient.invalidateQueries({ queryKey: ['all-chats-with-customer'] });
    queryClient.invalidateQueries({ queryKey: ['chat-markup-profit'] });
    queryClient.invalidateQueries({ queryKey: ['chatStats'] });
    queryClient.invalidateQueries({ queryKey: ['markup-profit-overview'] });
    onCompleted?.();
    setModalVisible(false);
  };

  const { data: subcategoriesData } = useQuery({
    queryKey: [department?.id, category?.id, 'subcategories'],
    queryFn: () => getSubCategories(token, department?.id.toString(), category?.id.toString()),
    enabled: !!department?.id && !!category?.id,
  });

  const { mutate: cryptoTransaction, isLoading: isCryptoTransactionPending } = useMutation({
    mutationKey: ['create-crypto-transaction'],
    mutationFn: createCryptoTransaction,
    onSuccess: (data) => {
      alert(data?.message || 'Transaction Completed successfully');
      // Create API marks chat Successful after the txn is saved
      finishLogged();
    },
    onError: (error: ApiError) => {
      alert(error?.message || 'Failed to create transaction');
    },
  });

  const { mutate: cardTransaction, isPending: isCardTransactionPending } = useMutation({
    mutationKey: ['create-card-transaction'],
    mutationFn: createCardTransaction,
    onSuccess: (data) => {
      if (formData.creditWallet) {
        const credited = formData.walletCreditAmount || formData.amountNaira;
        alert(
          `${data?.message || 'Transaction Completed successfully'}\n\nCustomer Naira wallet was credited with ₦${credited}.`
        );
      } else {
        alert(data?.message || 'Transaction Completed successfully');
      }
      // Create API marks chat Successful after the txn is saved
      finishLogged();
    },
    onError: (error: ApiError) => {
      alert(error?.message || 'Failed to create transaction');
    },
  });

  const handleInputChange = (field, value) => {
    const updatedData = { ...formData, [field]: value };

    if (field === 'amount' || field === 'exchangeRate') {
      const amount = parseFloat(updatedData.amount) || 0;
      const exchangeRate = parseFloat(updatedData.exchangeRate) || 0;
      const naira = amount * exchangeRate || '';
      updatedData.amountNaira = naira;
      if (updatedData.creditWallet && (field === 'amount' || field === 'exchangeRate')) {
        updatedData.walletCreditAmount = naira === '' ? '' : String(naira);
      }
    }

    if (field === 'creditWallet' && value === true) {
      updatedData.walletCreditAmount =
        updatedData.walletCreditAmount ||
        (updatedData.amountNaira !== '' ? String(updatedData.amountNaira) : '');
    }

    setFormData(updatedData);
  };

  const handleSubmit = () => {
    const {
      subcategory,
      amount,
      exchangeRate,
      amountNaira,
      cardType,
      cardNumber,
      cryptoAmount,
      fromAddress,
      toAddress,
      profit,
      creditWallet,
      walletCreditAmount,
    } = formData;

    const commonData = {
      subCategoryId: parseInt(subcategory),
      countryId: 2, // Default country ID
      chatId: parseInt(chatId),
      amount: parseFloat(amount),
      exchangeRate: parseFloat(exchangeRate),
      amountNaira: parseFloat(amountNaira),
      profit: parseFloat(profit),
    };

    const profitNgn = parseFloat(String(profit));
    if (!Number.isFinite(profitNgn) || profitNgn < 0) {
      alert('Enter profit in Naira (₦). This is what shows under Gift Card Profit.');
      return;
    }

    if (type === 'giftCard') {
      if (!cardType || !cardNumber) {
        alert('Please provide card type and card number.');
        return;
      }
      if (creditWallet) {
        const creditAmt = parseFloat(String(walletCreditAmount));
        if (!Number.isFinite(creditAmt) || creditAmt <= 0) {
          alert('Enter a valid Naira amount to credit the customer wallet.');
          return;
        }
      }
      cardTransaction({
        data: {
          ...commonData,
          profit: profitNgn,
          cardType,
          cardNumber,
          departmentId: department?.id,
          categoryId: category?.id,
          // Only send new fields when agent opts in — unchecked = identical to old API body
          ...(creditWallet
            ? {
                creditWallet: true,
                walletCreditAmount: parseFloat(String(walletCreditAmount)),
              }
            : {}),
        },
        token,
      });
    } else if (type === 'crypto') {
      if (!cryptoAmount || !fromAddress || !toAddress) {
        alert('Please provide crypto amount, from address, and to address.');
        return;
      }
      cryptoTransaction({
        data: {
          ...commonData,
          profit: profitNgn,
          cryptoAmount: parseFloat(cryptoAmount),
          fromAddress,
          toAddress,
          departmentId: department?.id,
          categoryId: category?.id,
        },
        token,
      });
    }
  };

  return (
    <>
      {modalVisibility && (
        <div className="absolute inset-0 z-[60] flex items-stretch justify-center bg-black/30 rounded-lg">
          <div className="bg-white overflow-y-auto h-full w-full max-w-lg shadow-lg relative">
            <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold flex-1 text-center">New Transaction</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6">
              <label className="block text-gray-700">Department</label>
              <select value={formData.department.id} disabled className="w-full p-2 border rounded-lg mb-4 bg-gray-100 text-gray-700">
                <option value={formData.department.id}>{formData.department.title}</option>
              </select>

              <label className="block text-gray-700">Category</label>
              <select value={formData.category.id} disabled className="w-full p-2 border rounded-lg mb-4 bg-gray-100 text-gray-700">
                <option value={formData.category.id}>{formData.category.title}</option>
              </select>

              <label className="block text-gray-700">Subcategory</label>
              <select value={formData.subcategory} onChange={(e) => handleInputChange('subcategory', e.target.value)} className="w-full p-2 border rounded-lg mb-4">
                <option value="">Select Subcategory</option>
                {subcategoriesData?.data?.subCategories.map((sub) => (
                  <option key={sub.subCategory.id} value={sub.subCategory.id}>
                    {sub.subCategory.title}
                  </option>
                ))}
              </select>

              <label className="block text-gray-700">Profit (₦)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.profit}
                onChange={(e) => handleInputChange('profit', e.target.value)}
                className="w-full p-2 border rounded-lg mb-1"
                placeholder="Required — shows under Gift Card Profit"
              />
              <p className="text-xs text-gray-500 mb-4">
                Enter the Naira profit for this sale. Amount above is the customer payout, not profit.
              </p>

              <label className="block text-gray-700">Amount (USD)</label>
              <input type="number" value={formData.amount} onChange={(e) => handleInputChange('amount', e.target.value)} className="w-full p-2 border rounded-lg mb-4" />

              <label className="block text-gray-700">Exchange Rate</label>
              <input type="number" value={formData.exchangeRate} onChange={(e) => handleInputChange('exchangeRate', e.target.value)} className="w-full p-2 border rounded-lg mb-4" />

              <label className="block text-gray-700">Amount in Naira</label>
              <input type="number" value={formData.amountNaira} readOnly className="w-full p-2 border rounded-lg mb-4 bg-gray-100 text-gray-700" />

              {type === 'giftCard' && (
                <>
                  <label className="block text-gray-700">Card Type</label>
                  <select value={formData.cardType} onChange={(e) => handleInputChange('cardType', e.target.value)} className="w-full p-2 border rounded-lg mb-4">
                    <option value="">Select Card Type</option>
                    <option value="E-code">E-code</option>
                    <option value="Physical Card">Physical Card</option>
                    <option value="Paper Code">Paper Code</option>
                  </select>

                  <label className="block text-gray-700">Card Number</label>
                  <input type="text" value={formData.cardNumber} onChange={(e) => handleInputChange('cardNumber', e.target.value)} className="w-full p-2 border rounded-lg mb-4" />

                  <div
                    className={`mb-4 p-3 rounded-lg border ${
                      formData.creditWallet
                        ? 'border-2 border-green-600 bg-green-50 shadow-sm ring-2 ring-green-200'
                        : 'border border-green-200 bg-green-50'
                    }`}
                  >
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.creditWallet}
                        onChange={(e) => handleInputChange('creditWallet', e.target.checked)}
                        className="mt-1"
                      />
                      <span>
                        <span className="block font-medium text-gray-800">
                          Pay customer (credit Naira wallet)
                        </span>
                        <span className="block text-sm text-gray-600">
                          Optional. Credits the customer&apos;s in-app Naira wallet. If they are on the old app (no wallet), this will be blocked — complete the sale without wallet credit instead.
                        </span>
                      </span>
                    </label>
                    {formData.creditWallet && (
                      <div className="mt-3">
                        <label className="block text-gray-700 text-sm">Wallet credit amount (₦)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.walletCreditAmount}
                          onChange={(e) => handleInputChange('walletCreditAmount', e.target.value)}
                          className="w-full p-2 border rounded-lg mt-1 bg-white"
                          placeholder="Enter amount to credit"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {type === 'crypto' && (
                <>
                  <label className="block text-gray-700">Crypto Amount</label>
                  <input type="number" value={formData.cryptoAmount} onChange={(e) => handleInputChange('cryptoAmount', e.target.value)} className="w-full p-2 border rounded-lg mb-4" />

                  <label className="block text-gray-700">From Address</label>
                  <input type="text" value={formData.fromAddress} onChange={(e) => handleInputChange('fromAddress', e.target.value)} className="w-full p-2 border rounded-lg mb-4" />

                  <label className="block text-gray-700">To Address</label>
                  <input type="text" value={formData.toAddress} onChange={(e) => handleInputChange('toAddress', e.target.value)} className="w-full p-2 border rounded-lg mb-4" />
                </>
              )}
            </div>

            <div className="px-6 pb-4 border-t flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isCardTransactionPending || isCryptoTransactionPending}
                className="bg-green-800 w-full text-white px-4 py-2 rounded-md hover:bg-green-900 disabled:opacity-60"
              >
                {isCardTransactionPending || isCryptoTransactionPending ? 'Submitting…' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewTransaction;
