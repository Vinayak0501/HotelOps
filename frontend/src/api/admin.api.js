// API helper for admin routes to getTodayTasks, getNotifications, mark the notifications, manual assign task, getRooms , update room status

import api from './axios';

export const getTodayTasks = function(){

    return api.get('/admin/tasks/today');

};

export const getNotifications = function(){

    return api.get('/admin/notifications');

};

export const markNotificationRead = function(id){

    return api.patch(`/admin/notifications/${id}/read`);

};


export const manualAssignTask = function(taskId, staffId){

    return api.patch(`/admin/tasks/${taskId}/assign`, { staffId });

}

export const getRooms = function(){

    return api.get('/rooms');

};

export const updateRoom = function(id, data){

    return api.patch(`/rooms/${id}`, data);

};
