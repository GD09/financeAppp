export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  category: string;
  type: TransactionType;
  isRecurring?: boolean;
  frequency?: 'weekly' | 'monthly' | 'yearly';
  nextDueDate?: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  period: 'monthly';
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning';
  createdAt: string; // ISO string
  read: boolean;
}

export interface Stock {
  symbol: string;
  name: string;
  change: number;
}

export interface Crypto {
  symbol: string;
  name: string;
  change: number;
}
