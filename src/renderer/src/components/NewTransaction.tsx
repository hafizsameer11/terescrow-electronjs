import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubCategories } from '@renderer/api/queries/commonqueries';
import { useAuth } from '@renderer/context/authContext';
import { createCardTransaction, createCryptoTransaction, changeChatStatus, ChatStatus } from '@renderer/api/queries/agent.mutations';
import { ApiError } from '@renderer/api/customApiCall';

const NewTransaction = ({ type, department, category, subcategories, chatId }) => {
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
  });

  const closeModal = () => {
    setModalVisible(false);
  };

  const { data: subcategoriesData } = useQuery({
    queryKey: [department?.id, category?.id, 'subcategories'],
    queryFn: () => getSubCategories(token, department?.id.toString(), category?.id.toString()),
    enabled: !!department?.id && !!category?.id,
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: (data) => changeChatStatus(data, token),
    onSuccess: (data) => {
      alert(data.message);
    },
    onError: (error: ApiError) => {
      alert(error.message);
    },
  });

  const { mutate: cryptoTransaction, isLoading: isCryptoTransactionPending } = useMutation({
    mutationKey: ['create-crypto-transaction'],
    mutationFn: createCryptoTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-chat-details'] });
      alert(data?.message || 'Transaction Completed successfully');
      changeStatus({ chatId, setStatus: ChatStatus.successful });
      closeModal();
    },
    onError: (error: ApiError) => {
      alert(error?.message || 'Failed to create transaction');
    },
  });

  const { mutate: cardTransaction, isLoading: isCardTransactionPending } = useMutation({
    mutationKey: ['create-card-transaction'],
    mutationFn: createCardTransaction,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customer-chat-details'] });
      alert(data?.message || 'Transaction Completed successfully');
      changeStatus({ chatId, setStatus: ChatStatus.successful });
      closeModal();
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
      updatedData.amountNaira = amount * exchangeRate || '';
    }

    setFormData(updatedData);
  };

  const handleSubmit = () => {
    const { subcategory, amount, exchangeRate, amountNaira, cardType, cardNumber, cryptoAmount, fromAddress, toAddress, profit } = formData;

    const commonData = {
      subCategoryId: parseInt(subcategory),
      countryId: 2, // Default country ID
      chatId: parseInt(chatId),
      amount: parseFloat(amount),
      exchangeRate: parseFloat(exchangeRate),
      amountNaira: parseFloat(amountNaira),
      profit: parseFloat(profit),
    };

    if (type === 'giftCard') {
      if (!cardType || !cardNumber) {
        alert('Please provide card type and card number.');
        return;
      }
      cardTransaction({
        data: {

          ...commonData,
          cardType,
          cardNumber,
          departmentId: department?.id,
          categoryId: category?.id,
        }, token
      });
    } else if (type === 'crypto') {
      if (!cryptoAmount || !fromAddress || !toAddress) {
        alert('Please provide crypto amount, from address, and to address.');
        return;
      }
      cryptoTransaction({
        data: {
          ...commonData,
          cryptoAmount: parseFloat(cryptoAmount),
          fromAddress,
          toAddress,
          departmentId: department?.id,
          categoryId: category?.id,
        }, token
      });
    }
  };

  return (
    <>
      {modalVisibility && (
        <div className="absolute w-full h-full right-[100%] flex items-center rounded-lg justify-center z-50">
          <div className="bg-white overflow-y-scroll h-[100%] rounded-lg shadow-lg w-11/12 max-w-lg overflow-hidden relative">
            <div className="p-4 border-b flex justify-between items-center">
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

              <label className="block text-gray-700">Profit</label>
              <input type="number" value={formData.profit} onChange={(e) => handleInputChange('profit', e.target.value)} className="w-full p-2 border rounded-lg mb-4" />

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
              <button onClick={handleSubmit} className="bg-green-800 w-full text-white px-4 py-2 rounded-md hover:bg-green-900">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewTransaction;
