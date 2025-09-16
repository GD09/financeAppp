import React, { useState, useRef, useEffect } from 'react';
import { ChartPieIcon, SunIcon, MoonIcon, BellIcon } from './icons/Icons';
import { SUPPORTED_CURRENCIES } from '../constants';
import { useTheme } from '../index';
import type { Notification } from '../types';
import NotificationsPanel from './NotificationsPanel';

interface HeaderProps {
    currency: string;
    onCurrencyChange: (newCurrency: string) => void;
    notifications: Notification[];
    onMarkAllAsRead: () => void;
    onClearNotifications: () => void;
}

const Header: React.FC<HeaderProps> = ({ currency, onCurrencyChange, notifications, onMarkAllAsRead, onClearNotifications }) => {
  const { theme, toggleTheme } = useTheme();
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
            setIsPanelVisible(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [panelRef]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-20">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <div className="flex items-center gap-3">
            <ChartPieIcon className="h-8 w-8 text-primary-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-wider">
              Gemini Finance Tracker
            </h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
            <label htmlFor="currency-select" className="sr-only">Select Currency</label>
            <select 
                id="currency-select"
                value={currency} 
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-2 pl-3 pr-8 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:outline-none appearance-none"
                aria-label="Select currency"
            >
                {Object.keys(SUPPORTED_CURRENCIES).map((code) => (
                    <option key={code} value={code}>{code}</option>
                ))}
            </select>
            <div className="relative" ref={panelRef}>
                <button
                    onClick={() => setIsPanelVisible(v => !v)}
                    className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative"
                    aria-label={`Toggle notifications panel. ${unreadCount} unread notifications.`}
                >
                    <BellIcon className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-2.5 w-2.5 transform -translate-y-1/2 translate-x-1/2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800"></span>
                    )}
                </button>
                {isPanelVisible && (
                    <NotificationsPanel 
                        notifications={notifications}
                        onMarkAllAsRead={onMarkAllAsRead}
                        onClearNotifications={onClearNotifications}
                    />
                )}
            </div>
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'dark' ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
