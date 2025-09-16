import React, { useState, useMemo } from 'react';
import type { Budget, Transaction } from '../types';
import { TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { TrashIcon, PlusCircleIcon } from './icons/Icons';

interface BudgetManagerProps {
  budgets: Budget[];
  transactions: Transaction[];
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, transactions, addBudget, deleteBudget, formatCurrency }) => {
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const monthlyExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
    
    const expensesByCategory = new Map<string, number>();

    transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.date.startsWith(currentMonth) && !t.isRecurring)
      .forEach(t => {
        expensesByCategory.set(t.category, (expensesByCategory.get(t.category) || 0) + t.amount);
      });
      
    return expensesByCategory;
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (budgets.some(b => b.category === category)) {
      setError('A budget for this category already exists.');
      return;
    }
    setError('');
    addBudget({ category, amount: parsedAmount, period: 'monthly' });
    setAmount('');
    setCategory(CATEGORIES.expense[0]);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Monthly Budgets</h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-grow bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 text-sm"
        >
          {CATEGORIES.expense.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input
          type="number"
          placeholder="Budget Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="sm:w-40 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-primary-500"
          step="0.01"
          min="0.01"
        />
        <button type="submit" className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2 px-4">
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add</span>
        </button>
      </form>
      {error && <p className="text-red-500 text-xs mb-4 -mt-2 text-center sm:text-left">{error}</p>}
      
      {budgets.length > 0 ? (
        <ul className="space-y-4">
          {budgets.map(budget => {
            const spent = monthlyExpenses.get(budget.category) || 0;
            const percentage = Math.min((spent / budget.amount) * 100, 100);
            const progressColor = percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500';

            return (
              <li key={budget.id}>
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span className="font-semibold">{budget.category}</span>
                  <div className="flex items-center gap-2">
                  <span className={`font-medium ${spent > budget.amount ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                    {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                  </span>
                  <button onClick={() => deleteBudget(budget.id)} className="text-gray-400 hover:text-red-500" aria-label={`Delete ${budget.category} budget`}><TrashIcon className="h-4 w-4"/></button>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className={`${progressColor} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No budgets set. Add one to start tracking your spending.
        </div>
      )}
    </div>
  );
};

export default BudgetManager;