import React, { useMemo } from 'react';
import type { Transaction } from '../types';
import { TransactionType } from '../types';
import CategoryChart from './CategoryChart';
import TopStocks from './TopStocks';
import { CurrencyDollarIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, BanknotesIcon } from './icons/Icons';

interface DashboardProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  currency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, formatCurrency, currency }) => {

  const { totalBalance } = useMemo(() => {
    return transactions.reduce(
      (acc, t) => {
        if (t.type === TransactionType.INCOME) {
          acc.totalBalance += t.amount;
        } else {
          acc.totalBalance -= t.amount;
        }
        return acc;
      },
      { totalBalance: 0 }
    );
  }, [transactions]);

  const { monthlyIncome, monthlyExpenses, monthlyBalance } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed, so make it 1-12

    const totals = transactions
      .filter(t => {
        if (!t.date) return false;
        const [year, month] = t.date.split('-').map(Number);
        return year === currentYear && month === currentMonth;
      })
      .reduce(
        (acc, t) => {
          if (t.type === TransactionType.INCOME) {
            acc.income += t.amount;
          } else {
            acc.expenses += t.amount;
          }
          return acc;
        },
        { income: 0, expenses: 0 }
      );
    
    return {
        monthlyIncome: totals.income,
        monthlyExpenses: totals.expenses,
        monthlyBalance: totals.income - totals.expenses
    }
  }, [transactions]);

  const expenseData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    transactions
      .filter((t) => t.type === TransactionType.EXPENSE)
      .forEach((t) => {
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
      });
    return Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dashboard</h2>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Financial Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <OverviewMetric title="Total Balance" value={formatCurrency(totalBalance)} icon={<CurrencyDollarIcon className="h-7 w-7 text-blue-500" />}/>
            <OverviewMetric title="This Month's Income" value={formatCurrency(monthlyIncome)} icon={<ArrowTrendingUpIcon className="h-7 w-7 text-green-500" />}/>
            <OverviewMetric title="This Month's Expenses" value={formatCurrency(monthlyExpenses)} icon={<ArrowTrendingDownIcon className="h-7 w-7 text-red-500" />}/>
            <OverviewMetric title="This Month's Net" value={formatCurrency(monthlyBalance)} isNet={true} netValue={monthlyBalance} icon={<BanknotesIcon className="h-7 w-7 text-gray-500" />}/>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
            {expenseData.length > 0 ? (
            <CategoryChart data={expenseData} formatCurrency={formatCurrency} />
            ) : (
            <div className="flex items-center justify-center h-full min-h-[200px] text-center text-gray-500 dark:text-gray-400">
                <p>No expense data available to display chart.</p>
            </div>
            )}
        </div>
        <TopStocks currency={currency} />
      </div>
    </div>
  );
};

interface OverviewMetricProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    isNet?: boolean;
    netValue?: number;
}

const OverviewMetric: React.FC<OverviewMetricProps> = ({ title, value, icon, isNet = false, netValue = 0 }) => {
    
    const valueColor = isNet
        ? (netValue >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500 dark:text-red-400')
        : 'text-gray-900 dark:text-white';
    
    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-center mb-2">{icon}</div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
    );
};


export default Dashboard;