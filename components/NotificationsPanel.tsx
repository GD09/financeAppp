import React from 'react';
import type { Notification } from '../types';
import { BellIcon } from './icons/Icons';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ notifications, onMarkAllAsRead, onClearNotifications }) => {
  const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  const sortedNotifications = [...notifications].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="absolute top-full right-0 mt-2 w-80 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-30">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="font-bold text-base">Notifications</h3>
        {notifications.length > 0 && (
          <div className="flex gap-2">
            <button onClick={onMarkAllAsRead} className="text-xs text-primary-500 hover:underline">Mark all as read</button>
            <button onClick={onClearNotifications} className="text-xs text-gray-500 hover:underline">Clear all</button>
          </div>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {sortedNotifications.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedNotifications.map(n => (
              <li key={n.id} className={`p-3 transition-colors duration-200 ${!n.read ? 'bg-primary-500/10 dark:bg-primary-500/20' : ''}`}>
                <p className={`text-sm ${n.type === 'warning' ? 'text-yellow-800 dark:text-yellow-300' : 'text-gray-800 dark:text-gray-200'}`}>{n.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{timeSince(n.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <BellIcon className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600"/>
            <p className="text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;
