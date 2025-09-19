import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { Transaction, Notification, Budget } from './types';
import { TransactionType } from './types';
import { useTransactions } from './hooks/useTransactions';
import { useBudgets } from './hooks/useBudgets';
import { useNotifications } from './hooks/useNotifications';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import AddTransactionForm from './components/AddTransactionForm';
import SidebarTabs from './components/SidebarTabs';
import TransactionFilters from './components/TransactionFilters';
import TransactionSort from './components/TransactionSort';
import type { SortConfig } from './components/TransactionSort';
import { PlusCircleIcon, SearchIcon, ArrowDownTrayIcon } from './components/icons/Icons';

interface Filters {
  type: 'all' | TransactionType;
  category: string;
}

const App: React.FC = () => {
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    updateTransaction,
  } = useTransactions();
  const { budgets, addBudget, deleteBudget } = useBudgets();
  const { notifications, addNotification, markAllAsRead, clearNotifications } = useNotifications();

  // In a real application, these rates would be fetched from a currency API
  const exchangeRates: { [key:string]: number } = {
    'USD': 1,
    'EUR': 0.93,
    'JPY': 157.25,
    'GBP': 0.79,
    'CAD': 1.37,
    'AUD': 1.50,
    'INR': 83.50,
  };

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [currency, setCurrency] = useState(() => {
    const currencyMap: { [key: string]: string } = {
        'US': 'USD', 'GB': 'GBP', 'JP': 'JPY', 'CA': 'CAD', 'AU': 'AUD', 'IN': 'INR',
        // Eurozone countries
        'AT': 'EUR', 'BE': 'EUR', 'CY': 'EUR', 'EE': 'EUR', 'FI': 'EUR', 'FR': 'EUR', 
        'DE': 'EUR', 'GR': 'EUR', 'IE': 'EUR', 'IT': 'EUR', 'LV': 'EUR', 'LT': 'EUR', 
        'LU': 'EUR', 'MT': 'EUR', 'NL': 'EUR', 'PT': 'EUR', 'SK': 'EUR', 'SI': 'EUR', 'ES': 'EUR',
    };

    try {
        const locale = navigator.language || 'en-US';
        const countryCode = locale.slice(-2).toUpperCase();
        const detectedCurrency = currencyMap[countryCode];
        
        // Check if the detected currency is one we support (i.e., have an exchange rate for).
        if (detectedCurrency && exchangeRates[detectedCurrency]) {
             return detectedCurrency;
        }
    } catch (e) {
        console.warn("Could not determine user locale for currency, defaulting to USD.", e);
    }
    
    return 'USD'; // Fallback currency
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>({ type: 'all', category: 'all' });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });

  const formatCurrency = useCallback((amount: number) => {
    const rate = exchangeRates[currency] || 1;
    const convertedAmount = amount * rate;
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(convertedAmount);
    } catch (e) {
        // Fallback for unsupported currency codes in some environments
        return `${currency} ${convertedAmount.toFixed(2)}`;
    }
  }, [currency]);

  // Effect for handling recurring transaction updates and notifications
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const transactionsToUpdate: Transaction[] = [];

    transactions.forEach(t => {
      if (!t.isRecurring || !t.nextDueDate || !t.frequency) {
        return;
      }
      
      let nextDueDate = new Date(t.nextDueDate + 'T00:00:00'); // Use T00:00:00 to avoid timezone issues
      let needsUpdate = false;
      const originalNextDueDate = new Date(t.nextDueDate + 'T00:00:00');

      // Loop to catch up if multiple periods have passed since the last check
      while (nextDueDate < today) {
        needsUpdate = true;
        switch (t.frequency) {
          case 'weekly': nextDueDate.setDate(nextDueDate.getDate() + 7); break;
          case 'monthly': nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
          case 'yearly': nextDueDate.setFullYear(nextDueDate.getFullYear() + 1); break;
          default: break;
        }
      }

      if (needsUpdate) {
        transactionsToUpdate.push({ ...t, nextDueDate: nextDueDate.toISOString().split('T')[0] });
      }

      const dateToCheckForNotification = needsUpdate ? nextDueDate : originalNextDueDate;
      const sevenDaysFromNow = new Date(today);
      sevenDaysFromNow.setDate(today.getDate() + 7);

      if (dateToCheckForNotification >= today && dateToCheckForNotification <= sevenDaysFromNow) {
        const message = `Upcoming recurring ${t.type}: "${t.description}" of ${formatCurrency(t.amount)} is due on ${dateToCheckForNotification.toLocaleDateString()}.`;
        addNotification({ type: 'info', message });
      }
    });

    if (transactionsToUpdate.length > 0) {
      // Batch update the transactions. In a real app, this might be a single API call.
      transactionsToUpdate.forEach(updatedTx => {
        updateTransaction(updatedTx);
      });
    }
  }, [transactions, updateTransaction, addNotification, formatCurrency]);

  // Effect for handling budget notifications
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM format

    const monthlyExpenses = new Map<string, number>();
    transactions
      .filter(t => t.type === TransactionType.EXPENSE && t.date.startsWith(currentMonth))
      .forEach(t => {
        monthlyExpenses.set(t.category, (monthlyExpenses.get(t.category) || 0) + t.amount);
      });

    budgets.forEach(budget => {
      const spent = monthlyExpenses.get(budget.category) || 0;
      const percentage = (spent / budget.amount) * 100;

      if (percentage >= 90) {
        const message = `You've spent ${formatCurrency(spent)} (${percentage.toFixed(0)}%) of your ${formatCurrency(budget.amount)} budget for ${budget.category} this month.`;
        addNotification({ type: 'warning', message });
      }
    });
  }, [transactions, budgets, addNotification, formatCurrency]);


  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setEditingTransaction(null);
  };

  const handleFormSubmit = (transaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction({ ...transaction, id: editingTransaction.id });
    } else {
      addTransaction({
        ...transaction,
        id: crypto.randomUUID(),
      });
    }
    handleFormClose();
  };
  
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };
  
  const handleClearFilters = () => {
    setSearchTerm('');
    setFilters({ type: 'all', category: 'all' });
  };
  
  const handleSortChange = (newConfig: SortConfig) => {
    setSortConfig(newConfig);
  };

  const filteredTransactions = useMemo(() => {
    const filtered = transactions
      .filter(t => !t.isRecurring) // Don't show recurring templates in the main list
      .filter(t => {
        // Filter by type
        return filters.type === 'all' || t.type === filters.type;
      })
      .filter(t => {
        // Filter by category
        return filters.category === 'all' || t.category === filters.category;
      })
      .filter(t => {
        // Filter by search term
        return t.description.toLowerCase().includes(searchTerm.toLowerCase());
      });

    // Sort the filtered results
    return [...filtered].sort((a, b) => {
        const key = sortConfig.key;
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        if (key === 'date') {
            return (new Date(a.date).getTime() - new Date(b.date).getTime()) * direction;
        }
        
        if (key === 'description') {
            return a.description.localeCompare(b.description) * direction;
        }
        
        if (key === 'amount') {
            return (a.amount - b.amount) * direction;
        }
        
        return 0;
    });

  }, [transactions, searchTerm, filters, sortConfig]);
  
  const handleExportCSV = useCallback(() => {
    if (filteredTransactions.length === 0) {
      alert("No transactions to export.");
      return;
    }

    const headers = ['Date', 'Description', 'Amount (USD)', 'Category', 'Type'];
    
    const escapeCsvCell = (cell: any) => {
        const strCell = String(cell);
        if (strCell.includes(',') || strCell.includes('"') || strCell.includes('\n')) {
            // Enclose in double quotes and escape existing double quotes
            return `"${strCell.replace(/"/g, '""')}"`;
        }
        return strCell;
    };

    const formatDateForCSV = (dateString: string) => {
        // dateString is 'YYYY-MM-DD'. Appending time to handle timezones correctly.
        const date = new Date(dateString + 'T00:00:00');
        // Format to MM/DD/YYYY which is widely supported by spreadsheet software.
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    };

    const csvRows = [
      headers.join(','),
      ...filteredTransactions.map(t => [
        escapeCsvCell(formatDateForCSV(t.date)),
        escapeCsvCell(t.description),
        escapeCsvCell(t.amount.toFixed(2)),
        escapeCsvCell(t.category),
        escapeCsvCell(t.type)
      ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

  }, [filteredTransactions]);

  const nonRecurringTransactions = useMemo(() => transactions.filter(t => !t.isRecurring), [transactions]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-200 font-sans transition-colors duration-300">
      <Header 
        currency={currency} 
        onCurrencyChange={setCurrency} 
        notifications={notifications}
        onMarkAllAsRead={markAllAsRead}
        onClearNotifications={clearNotifications}
      />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Dashboard transactions={nonRecurringTransactions} formatCurrency={formatCurrency} currency={currency} />
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={filteredTransactions.length === 0}
                        aria-label="Export transactions to CSV"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
                    >
                        <PlusCircleIcon className="h-5 w-5" />
                        <span>Add New</span>
                    </button>
                </div>
              </div>

              {/* Transaction Controls */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg space-y-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <SearchIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
                        aria-label="Search transactions"
                      />
                    </div>
                     <TransactionSort sortConfig={sortConfig} onSortChange={handleSortChange} />
                  </div>
                 <TransactionFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    transactions={nonRecurringTransactions}
                  />
              </div>


              <TransactionList transactions={filteredTransactions} onDelete={deleteTransaction} onEdit={handleEdit} formatCurrency={formatCurrency} />
            </div>
          </div>
          <div className="lg:col-span-1">
             <SidebarTabs 
                transactions={transactions}
                budgets={budgets}
                addBudget={addBudget}
                deleteBudget={deleteBudget}
                formatCurrency={formatCurrency}
             />
          </div>
        </div>
      </main>

      {isFormVisible && (
        <AddTransactionForm
          onSubmit={handleFormSubmit}
          onClose={handleFormClose}
          existingTransaction={editingTransaction}
          currency={currency}
          exchangeRates={exchangeRates}
        />
      )}
    </div>
  );
};

export default App;