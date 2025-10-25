import React, { useState, useMemo } from 'react';
import { Theme } from '../hooks/useSeason';
import { useTranslation } from '../hooks/useTranslation';
import { CloseIcon, AlertIcon, RainIcon, ClockIcon } from './Icons';
import { Notification } from '../types';

interface NotificationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    seasonTheme: Theme;
}

const NotificationIcon: React.FC<{type: Notification['type']}> = ({ type }) => {
    switch (type) {
        case 'disease': return <AlertIcon />;
        case 'weather': return <RainIcon />;
        case 'task': return <ClockIcon />;
        default: return <AlertIcon />;
    }
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, seasonTheme }) => {
    const { t } = useTranslation();

    const initialNotifications: Notification[] = useMemo(() => [
        { id: '1', type: 'disease', titleKey: 'notification_disease_title', messageKey: 'notification_disease_message', timestamp: new Date(Date.now() - 3600000).toISOString(), isRead: false },
        { id: '2', type: 'weather', titleKey: 'notification_weather_title', messageKey: 'notification_weather_message', timestamp: new Date(Date.now() - 7200000).toISOString(), isRead: false },
        { id: '3', type: 'task', titleKey: 'notification_task_title', messageKey: 'notification_task_message', timestamp: new Date(Date.now() - 86400000).toISOString(), isRead: true },
    ], []);

    const [notifications, setNotifications] = useState(initialNotifications);

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const timeSince = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="notification-panel-title"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                        <h2 id="notification-panel-title" className={`text-lg font-bold ${seasonTheme.text}`}>{t('notification_panel_title')}</h2>
                        <div className="flex items-center space-x-2">
                             <button onClick={handleMarkAllAsRead} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:opacity-80">{t('mark_all_as_read')}</button>
                             <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Close panel">
                                <CloseIcon />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto">
                        {notifications.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {notifications.map(notification => (
                                    <li key={notification.id} className={`p-4 flex items-start space-x-4 transition-colors ${!notification.isRead ? 'bg-black/5 dark:bg-white/5' : ''}`}>
                                        <div className={`flex-shrink-0 mt-1 w-8 h-8 flex items-center justify-center rounded-full ${
                                            notification.type === 'disease' ? 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300' :
                                            notification.type === 'weather' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300' :
                                            'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300'
                                        }`}>
                                            <NotificationIcon type={notification.type} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-800 dark:text-gray-100">{t(notification.titleKey)}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300">{t(notification.messageKey)}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{timeSince(notification.timestamp)}</p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="flex-shrink-0 mt-1 w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500 dark:text-gray-400">{t('no_new_notifications')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;