import React from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { PencilIcon, TrashIcon, ArrowDownIcon, ArrowUpIcon } from './icons/Icons';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  formatCurrency: (amount: number) => string;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, formatCurrency }) => {

  if(transactions.length === 0) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center text-gray-500 dark:text-gray-400">
            <p>No transactions yet. Click "Add New" to get started!</p>
        </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {transactions.map((t) => (
          <li key={t.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200">
            <div className="flex items-center gap-4 mb-2 md:mb-0">
              <div className={`p-2 rounded-full ${t.type === TransactionType.INCOME ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                {t.type === TransactionType.INCOME ? <ArrowUpIcon className="h-5 w-5"/> : <ArrowDownIcon className="h-5 w-5"/>}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{t.description}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })} - <span className="font-medium text-gray-700 dark:text-gray-300">{t.category}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-4">
              <p className={`font-bold text-lg ${t.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {t.type === TransactionType.INCOME ? '+' : '-'}
                {formatCurrency(t.amount)}
              </p>
              <div className="flex gap-2">
                 <button onClick={() => onEdit(t)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200" aria-label={`Edit transaction ${t.description}`}>
                    <PencilIcon className="h-5 w-5" />
                 </button>
                 <button onClick={() => onDelete(t.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200" aria-label={`Delete transaction ${t.description}`}>
                    <TrashIcon className="h-5 w-5" />
                 </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;