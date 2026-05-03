// API helper to apply for leaves, get my leaves, get pending leaves, update leave status

import api from './axios';

export const applyLeave = function(data){

    return api.post('/leave/apply', data);

};


export const getMyLeaves = function(){

    return api.get('/leave/my-leaves');

};

export const getPendingLeaves = function(){

    return api.get('/leave/pending');

};


export const updateLeave = function(id, status){

    return api.patch(`/leave/${id}`, { status });

}