// API helper to checkIn , checkOut attendance, get today's attendance

import api from './axios';

export const checkIn = function(){

    return api.post('/attendance/checkin');

};


export const checkOut = function(){

    return api.post('/attendance/checkout');

};

export const getAttendanceStatus = function(){

    return api.get('/attendance/status');

};

export const getTodayAttendance = function(){

    return api.get('/admin/attendance/today');

};
