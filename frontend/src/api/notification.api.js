import api from './axios';

export function getNotifications() {
  return api.get('/notifications');
}

export function markNotificationRead(id) {
  return api.patch(`/notifications/${id}/read`);
}
