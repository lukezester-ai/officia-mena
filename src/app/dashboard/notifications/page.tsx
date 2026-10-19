'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, Trash2, Clock, AlertCircle, Info, CheckCircle } from 'lucide-react';

type Notification = {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  actionLabel?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/notifications');
        const res = await response.json();
        if (res.success && res.data) {
          setNotifications(res.data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    void fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', notificationId: id }),
      });
      const res = await response.json();
      if (res.success) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-all-read' }),
      });
      const res = await response.json();
      if (res.success) {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications?action=delete&notificationId=${id}`, {
        method: 'DELETE',
      });
      const res = await response.json();
      if (res.success) {
        setNotifications(notifications.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-emerald-400" size={20} />;
      case 'warning':
        return <AlertCircle className="text-amber-400" size={20} />;
      case 'error':
        return <X className="text-rose-400" size={20} />;
      default:
        return <Info className="text-blue-400" size={20} />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30';
      case 'warning':
        return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
      case 'error':
        return 'bg-rose-400/20 text-rose-300 border-rose-400/30';
      default:
        return 'bg-blue-400/20 text-blue-300 border-blue-400/30';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => filter === 'unread' ? !n.isRead : n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-desert-900)] mb-2 flex items-center gap-3">
            <Bell className="text-[var(--color-gold-600)] size={32} />
            الإشعارات
          </h1>
          <p className="text-[var(--color-desert-600)]">تتبع جميع الإشعارات والتنبيهات</p>
        </div>
        
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllAsRead}
              className="bg-white border border-[var(--color-desert-200)] text-[var(--color-desert-700)] px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[var(--color-desert-50)] transition-colors shadow-sm"
            >
              <Check size={18} />
              تعليب الكل كمقروء
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">إجمالي الإشعارات</div>
          <div className="text-3xl font-black text-[var(--color-desert-900)]">{notifications.length}</div>
        </div>
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">غير مقروء</div>
          <div className="text-3xl font-black text-[var(--color-desert-900)]">{unreadCount}</div>
        </div>
        <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-bold text-[var(--color-desert-600)] mb-2">مقروء</div>
          <div className="text-3xl font-black text-[var(--color-desert-900)]">{notifications.length - unreadCount}</div>
        </div>
      </div>

      <div className="bg-white border border-[var(--color-desert-200)] rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--color-desert-200)] flex justify-between items-center bg-[var(--color-desert-50)]">
          <div className="flex gap-3">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'all' ? 'bg-[var(--color-desert-900)] text-white' : 'text-[var(--color-desert-700)] hover:bg-[var(--color-desert-100)]'}`}
            >
              الكل
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'unread' ? 'bg-[var(--color-desert-900)] text-white' : 'text-[var(--color-desert-700)] hover:bg-[var(--color-desert-100)]'}`}
            >
              غير مقروء
            </button>
            <button 
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'read' ? 'bg-[var(--color-desert-900)] text-white' : 'text-[var(--color-desert-700)] hover:bg-[var(--color-desert-100)]'}`}
            >
              مقروء
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm whitespace-nowrap">
            <thead className="bg-[var(--color-desert-50)]/50 text-[var(--color-desert-600)] border-b border-[var(--color-desert-200)]">
              <tr>
                <th className="py-3 px-6 font-medium">النوع</th>
                <th className="py-3 px-6 font-medium">العنوان</th>
                <th className="py-3 px-6 font-medium">الرسالة</th>
                <th className="py-3 px-6 font-medium">التاريخ</th>
                <th className="py-3 px-6 font-medium">الحالة</th>
                <th className="py-3 px-6 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-desert-100)] text-[var(--color-desert-900)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--color-desert-500)]">جاري التحميل...</td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[var(--color-desert-500)]">لا توجد إشعارات</td>
                </tr>
              ) : (
                filteredNotifications.map((notification) => (
                  <tr 
                    key={notification.id} 
                    className={`hover:bg-[var(--color-desert-50)]/50 transition-colors ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {getIcon(notification.type)}
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-bold ${getBadgeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold">{notification.title}</td>
                    <td className="py-4 px-6 text-sm text-[var(--color-desert-600)]">{notification.message}</td>
                    <td className="py-4 px-6 font-mono text-sm">
                      {notification.createdAt instanceof Date 
                        ? notification.createdAt.toLocaleDateString('ar-SA') + ' ' + notification.createdAt.toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})
                        : new Date(notification.createdAt).toLocaleDateString('ar-SA') + ' ' + new Date(notification.createdAt).toLocaleTimeString('ar-SA', {hour: '2-digit', minute: '2-digit'})
                      }
                    </td>
                    <td className="py-4 px-6">
                      {notification.isRead ? (
                        <span className="text-[var(--color-desert-500)]">مقروء</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-300">
                          جديد
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="bg-white border border-[var(--color-desert-200)] text-[var(--color-desert-700)] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[var(--color-desert-50)] transition-colors"
                          >
                            <Check size={14} />
                          قراءة
                          </button>
                        )}
                        {notification.actionUrl && (
                          <a 
                            href={notification.actionUrl}
                            className="bg-[var(--color-gold-50)] border border-[var(--color-gold-200)] text-[var(--color-gold-700)] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[var(--color-gold-100)] transition-colors"
                          >
                            {notification.actionLabel || 'عرض'}
                          </a>
                        )}
                        <button 
                          onClick={() => handleDelete(notification.id)}
                          className="bg-white border border-rose-400/20 text-rose-700 px-3 py-1 rounded-lg text-xs font-bold hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
