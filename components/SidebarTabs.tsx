import React, { useState } from 'react';
import type { Transaction, Budget } from '../types';
import AiAssistant from './AiAssistant';
import BudgetManager from './BudgetManager';
import CryptoWatchlist from './CryptoWatchlist';
import { SparklesIcon, WalletIcon, ChartBarIcon } from './icons/Icons';

interface SidebarTabsProps {
    transactions: Transaction[];
    budgets: Budget[];
    addBudget: (budget: Omit<Budget, 'id'>) => void;
    deleteBudget: (id: string) => void;
    formatCurrency: (amount: number) => string;
}

type Tab = 'assistant' | 'budgets' | 'watchlist';

const SidebarTabs: React.FC<SidebarTabsProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('assistant');

    const tabs: { id: Tab, name: string, icon: React.ReactNode }[] = [
        { id: 'assistant', name: 'AI Assistant', icon: <SparklesIcon className="h-5 w-5" /> },
        { id: 'budgets', name: 'Budgets', icon: <WalletIcon className="h-5 w-5" /> },
        { id: 'watchlist', name: 'Watchlist', icon: <ChartBarIcon className="h-5 w-5" /> },
    ];
    
    const renderContent = () => {
        switch(activeTab) {
            case 'assistant':
                return <AiAssistant transactions={props.transactions.filter(t => !t.isRecurring)} />;
            case 'budgets':
                return <BudgetManager {...props} />;
            case 'watchlist':
                return <CryptoWatchlist />;
            default:
                return null;
        }
    }
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-[calc(100vh-10rem)] max-h-[750px] sticky top-24">
            <div className="flex justify-between border-b border-gray-200 dark:border-gray-700 px-2 pt-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-1 text-sm font-semibold transition-colors border-b-2
                            ${activeTab === tab.id 
                                ? 'text-primary-500 border-primary-500' 
                                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-gray-600'
                            }`
                        }
                        aria-current={activeTab === tab.id ? 'page' : undefined}
                    >
                        {tab.icon}
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>
            <div className="flex-1 overflow-y-auto">
                {renderContent()}
            </div>
        </div>
    );
};

export default SidebarTabs;