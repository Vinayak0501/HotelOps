// api helper to get all the staff and its performance
import api from './axios';

export const getAllStaff = function(){
    
    return api.get('/admin/staff');

}

export const getPerformance = function(){

    return api.get('/admin/performance');

}
