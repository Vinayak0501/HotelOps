//  API helper functions for authentication (register/ login)

import api from './axios';

export const login = async function(data){
    
    const response = await api.post('/auth/login', data);
    return response;

}

export const register = async function(data){

    const response = await api.post('/auth/register', data);
    return response;
    
}