

import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';

const STORAGE_KEY = 'finance-tracker-transactions';

const initialTransactions: Transaction[] = [
    {
        id: '1',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Monthly Salary',
        amount: 5000,
        category: 'Salary',
        type: TransactionType.INCOME,
    },
    {
        id: '2',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Grocery Shopping',
        amount: 150.75,
        category: 'Groceries',
        type: TransactionType.EXPENSE,
    },
    {
        id: '3',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Electricity Bill',
        amount: 75.20,
        category: 'Utilities',
        type: TransactionType.EXPENSE,
    },
    {
        id: '4',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Dinner with friends',
        amount: 80.00,
        category: 'Dining Out',
        type: TransactionType.EXPENSE,
    },
];


export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const storedTransactions = window.localStorage.getItem(STORAGE_KEY);
      return storedTransactions ? JSON.parse(storedTransactions) : initialTransactions;
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return initialTransactions;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error writing to localStorage', error);
    }
  }, [transactions]);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [...prev, transaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTransaction = useCallback((updatedTransaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
  }, []);

  return { transactions, addTransaction, deleteTransaction, updateTransaction };
};
