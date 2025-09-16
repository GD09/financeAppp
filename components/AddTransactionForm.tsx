import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { CATEGORIES } from '../constants';

interface AddTransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
  existingTransaction: Transaction | null;
  currency: string;
  exchangeRates: { [key: string]: number };
}

const AddTransactionForm: React.FC<AddTransactionFormProps> = ({ 
    onSubmit, 
    onClose, 
    existingTransaction,
    currency,
    exchangeRates 
}) => {
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [errors, setErrors] = useState<Partial<Record<'description' | 'amount' | 'date', string>>>({});

  useEffect(() => {
    if (existingTransaction) {
        const rate = exchangeRates[currency] || 1;
        const convertedAmount = existingTransaction.amount * rate;
        
        setType(existingTransaction.type);
        setDescription(existingTransaction.description);
        setAmount(convertedAmount.toFixed(2).toString());
        setCategory(existingTransaction.category);
        setDate(existingTransaction.date);
        setIsRecurring(existingTransaction.isRecurring || false);
        setFrequency(existingTransaction.frequency || 'monthly');
    } else {
        // Reset form for new transaction
        setType(TransactionType.EXPENSE);
        setDescription('');
        setAmount('');
        setCategory(CATEGORIES.expense[0]);
        setDate(new Date().toISOString().split('T')[0]);
        setIsRecurring(false);
        setFrequency('monthly');
    }
  }, [existingTransaction, currency, exchangeRates]);

  useEffect(() => {
    // Reset category when type changes, but only for new transactions
    if (!existingTransaction) {
       setCategory(type === TransactionType.EXPENSE ? CATEGORIES.expense[0] : CATEGORIES.income[0]);
    }
  }, [type, existingTransaction]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<'description' | 'amount' | 'date', string>> = {};

    if (!description.trim()) {
        newErrors.description = 'Description is required.';
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        newErrors.amount = 'Please enter a valid positive amount.';
    }
    
    const selectedDate = new Date(date);
    // Create a date for 'today' that ignores the time component for accurate comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!date || isNaN(selectedDate.getTime())) {
        newErrors.date = 'Please enter a valid date.';
    } else if (selectedDate > today && !isRecurring) {
        newErrors.date = 'Date cannot be in the future for non-recurring transactions.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    
    const enteredAmount = parseFloat(amount);
    const rate = exchangeRates[currency] || 1;
    // Convert the amount back to the base currency (USD) for storage
    const amountInUSD = enteredAmount / rate;

    let nextDueDate: string | undefined = undefined;

    if (isRecurring && !existingTransaction) { // Only calculate for new recurring transactions
        const startDate = new Date(date + 'T00:00:00');
        switch(frequency) {
            case 'weekly': startDate.setDate(startDate.getDate() + 7); break;
            case 'monthly': startDate.setMonth(startDate.getMonth() + 1); break;
            case 'yearly': startDate.setFullYear(startDate.getFullYear() + 1); break;
        }
        nextDueDate = startDate.toISOString().split('T')[0];
    }


    onSubmit({
      date,
      description,
      amount: amountInUSD,
      category,
      type,
      isRecurring,
      frequency: isRecurring ? frequency : undefined,
      nextDueDate: isRecurring ? (existingTransaction?.nextDueDate || nextDueDate) : undefined,
    });
  };

  const categories = type === TransactionType.EXPENSE ? CATEGORIES.expense : CATEGORIES.income;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{existingTransaction ? 'Edit' : 'Add'} Transaction</h2>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
            <div className="flex gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
                <button type="button" onClick={() => setType(TransactionType.EXPENSE)} className={`w-full py-2 rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Expense</button>
                <button type="button" onClick={() => setType(TransactionType.INCOME)} className={`w-full py-2 rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>Income</button>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
            <input id="description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} className={`w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-primary-500 focus:border-primary-500`} required/>
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Amount <span className="text-xs text-gray-400 dark:text-gray-500">(in {currency})</span></label>
                <input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={`w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border ${errors.amount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-primary-500 focus:border-primary-500`} step="0.01" min="0.01" required/>
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
            </div>
            <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{isRecurring ? 'Start Date' : 'Date'}</label>
                <input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className={`w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:ring-2 focus:ring-primary-500 focus:border-primary-500`} required/>
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
          </div>
          
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" required>
                {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="space-y-4">
             <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="is-recurring" 
                  checked={isRecurring} 
                  onChange={(e) => setIsRecurring(e.target.checked)} 
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500"
                  disabled={!!existingTransaction} // Can't change recurring status on edit
                />
                <label htmlFor="is-recurring" className="text-sm font-medium text-gray-600 dark:text-gray-400">This is a recurring transaction</label>
              </div>

              {isRecurring && (
                <div>
                  <label htmlFor="frequency" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Frequency</label>
                  <select 
                    id="frequency" 
                    value={frequency} 
                    onChange={(e) => setFrequency(e.target.value as any)} 
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={!!existingTransaction}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                   {!!existingTransaction && <p className="text-xs text-gray-400 mt-1">Recurring properties cannot be edited.</p>}
                </div>
              )}
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold transition-colors">Cancel</button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-colors">{existingTransaction ? 'Save Changes' : 'Add Transaction'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionForm;
