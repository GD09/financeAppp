import React from 'react';
import { BarsArrowDownIcon, BarsArrowUpIcon } from './icons/Icons';

export interface SortConfig {
  key: 'date' | 'description' | 'amount';
  direction: 'asc' | 'desc';
}

interface TransactionSortProps {
  sortConfig: SortConfig;
  onSortChange: (newConfig: SortConfig) => void;
}

const TransactionSort: React.FC<TransactionSortProps> = ({ sortConfig, onSortChange }) => {
  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSortChange({ ...sortConfig, key: e.target.value as SortConfig['key'] });
  };
  
  const toggleDirection = () => {
    onSortChange({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-key" className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden lg:block">Sort by:</label>
      <select
        id="sort-key"
        value={sortConfig.key}
        onChange={handleKeyChange}
        className="w-full sm:w-auto bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors py-2 px-3 appearance-none"
        aria-label="Sort by"
      >
        <option value="date">Date</option>
        <option value="description">Description</option>
        <option value="amount">Amount</option>
      </select>
      <button
        onClick={toggleDirection}
        className="p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
        aria-label={`Sort direction: ${sortConfig.direction === 'asc' ? 'Ascending' : 'Descending'}`}
      >
        {sortConfig.direction === 'asc' ? <BarsArrowUpIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <BarsArrowDownIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
      </button>
    </div>
  );
};

export default TransactionSort;