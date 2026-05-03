// API helper function for staff to get his tasks , start the task , complete the task

import api from './axios';

export const getMyTasks = async function () {
    
    const response = await api.get('/tasks/my-tasks');
    return response;

}


export const startTask = function(id){

    return api.post(`/tasks/${id}/start`);

}

export const completeTask = function(id){

    return api.post(`/tasks/${id}/complete`);

}
