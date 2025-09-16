import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { XCircleIcon } from './icons/Icons';

interface Filters {
  type: 'all' | TransactionType;
  category: string;
}

interface TransactionFiltersProps {
  filters: Filters;
  onFilterChange: (newFilters: Filters) => void;
  onClearFilters: () => void;
  transactions: Transaction[];
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ filters, onFilterChange, onClearFilters, transactions }) => {
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      type: e.target.value as 'all' | TransactionType,
      category: 'all',
    });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      category: e.target.value,
    });
  };

  const availableCategories = useMemo(() => {
    if (filters.type === 'all') {
      const allCategories = new Set(transactions.map(t => t.category));
      return Array.from(allCategories).sort();
    }
    return CATEGORIES[filters.type];
  }, [filters.type, transactions]);

  const isFilterActive = filters.type !== 'all' || filters.category !== 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-2 items-center">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 hidden lg:block">Filter by:</span>
      <div className="flex-grow sm:flex-grow-0">
        <label htmlFor="type-filter" className="sr-only">Filter by type</label>
        <select
          id="type-filter"
          value={filters.type}
          onChange={handleTypeChange}
          className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors py-2 px-3"
          aria-label="Filter by transaction type"
        >
          <option value="all">All Types</option>
          <option value={TransactionType.INCOME}>Income</option>
          <option value={TransactionType.EXPENSE}>Expense</option>
        </select>
      </div>

      <div className="flex-grow sm:flex-grow-0">
        <label htmlFor="category-filter" className="sr-only">Filter by category</label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={handleCategoryChange}
          className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors py-2 px-3"
          aria-label="Filter by category"
          disabled={availableCategories.length === 0}
        >
          <option value="all">All Categories</option>
          {availableCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {isFilterActive && (
         <button
            onClick={onClearFilters}
            className="flex items-center justify-center gap-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
            aria-label="Clear filters"
        >
            <XCircleIcon className="h-4 w-4" />
            <span>Clear</span>
        </button>
      )}
    </div>
  );
};

export default TransactionFilters;