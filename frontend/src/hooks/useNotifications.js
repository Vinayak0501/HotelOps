import { useState, useEffect, useCallback } from 'react';
import { getPendingLeaves } from '../api/leave.api';
import { getNotifications, markNotificationRead } from '../api/notification.api';
import { useAuth } from '../context/AuthContext';

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [leaveCount, setLeaveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async function () {
    if (!user) {
      setNotifications([]);
      setLeaveCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const notifPromise = getNotifications();
      const leavePromise = user.role === 'admin'
        ? getPendingLeaves()
        : Promise.resolve({ data: [] });

      const [notifRes, leaveRes] = await Promise.all([notifPromise, leavePromise]);

      setNotifications(notifRes.data);
      setLeaveCount(leaveRes.data.length);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  async function markAsRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((previous) => previous.filter((notification) => notification._id !== id));
      window.dispatchEvent(new CustomEvent('notification-updated'));

    } 
    catch (err) {
      console.log(err);
    }
  }

  return {
    notifications,
    loading,
    error,
    leaveCount,
    count: notifications.length,
    totalCount: notifications.length + leaveCount,
    markAsRead,
    refresh: fetchNotifications,
  };
}
