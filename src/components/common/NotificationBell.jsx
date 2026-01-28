import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllAsRead
} from "../../store/slices/notificationSlice";

export default function NotificationBell() {
    const dispatch = useDispatch();
    const { items, unreadCount, loading } = useSelector((state) => state.notifications);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Initial fetch
    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleItemClick = (notification) => {
        if (!notification.is_read) {
            dispatch(markNotificationAsRead(notification.id));
        }
    };

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleToggle}
                className="relative p-2 rounded-full hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-black transform translate-x-1/4 -translate-y-1/4 bg-neon rounded-full">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                        <h3 className="text-sm font-semibold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-neon hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading && items.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500 text-sm">
                                Loading...
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-4 text-center text-zinc-500 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            <ul className="divide-y divide-zinc-800">
                                {items.map((notification) => (
                                    <li
                                        key={notification.id}
                                        onClick={() => handleItemClick(notification)}
                                        className={`p-4 hover:bg-zinc-800/50 cursor-pointer transition-colors ${!notification.is_read ? "bg-zinc-800/20" : ""
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-1 space-y-1">
                                                <p className={`text-sm ${!notification.is_read ? "text-white font-medium" : "text-zinc-400"}`}>
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-zinc-600">
                                                    {new Date(notification.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                            {!notification.is_read && (
                                                <div className="w-2 h-2 mt-1.5 rounded-full bg-neon flex-shrink-0" />
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
