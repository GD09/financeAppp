import { useState, useCallback } from 'react';
import type { Notification } from '../types';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
        const newNotification: Notification = {
            ...notification,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            read: false,
        };
        // Avoid duplicate messages for the same period
        setNotifications(prev => {
            if (prev.some(n => n.message === newNotification.message)) {
                return prev;
            }
            // Keep the list from getting too long
            const updatedNotifications = [newNotification, ...prev];
            return updatedNotifications.slice(0, 50);
        });
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return { notifications, addNotification, markAllAsRead, clearNotifications };
};
