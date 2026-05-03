import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:3000/api',
    timeout: 10000 // request fails if it takes more than 10 sec
});


// attach token to the auth headers for req
instance.interceptors.request.use(function(config){

    const token = localStorage.getItem('token');

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
});


// handle response (or error) coming from the backend

instance.interceptors.response.use(

    // 1) success
    function(response){
        return response;
    },

    // 2) error
    function(error){

        // check for unauthorized access (like accessing admin routes with staff token, token expired, or some fake token used)

        if(error.response?.status === 401){
            if(window.location.pathname !== '/login'){
                localStorage.clear();
                window.location.href = '/login';    
            }
        }

        // status code --> 403 --> forbidden acces
        if(error.response?.status === 403){
            console.log('Forbidden');
        }

        if(error.response?.status === 500){
            console.log('Server error');
        }

        return Promise.reject(error); // sending the err to the catch block
    }
);

export default instance;