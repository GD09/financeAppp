import { useState, useEffect, useCallback } from 'react';
import type { Budget } from '../types';

const STORAGE_KEY = 'finance-tracker-budgets';

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const storedBudgets = window.localStorage.getItem(STORAGE_KEY);
      return storedBudgets ? JSON.parse(storedBudgets) : [];
    } catch (error) {
      console.error('Error reading budgets from localStorage', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    } catch (error) {
      console.error('Error writing budgets to localStorage', error);
    }
  }, [budgets]);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: crypto.randomUUID() };
    setBudgets((prev) => [...prev, newBudget]);
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { budgets, addBudget, deleteBudget };
};
