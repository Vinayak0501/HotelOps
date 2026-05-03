// CREATING A GLOBAL MEMORY for application
// avoiding prop-drilling
// instead of passing user's data through different components as props --> creating a context so that any component inside that can access it directly.

import { createContext , useContext, useState } from "react";

// AuthContext ==> 
const AuthContext = createContext(null); // will be used to contain user's token and profile data so that rest of the application can grab it

export function AuthProvider({ children }){

    // Lazy state initialization --> check localStorage only once when the app first opens 
    // if () => function not userd ==> react would read hard drive everysingle time a user typed a letter in search bar

    const [ token, setToken ] = useState(() => localStorage.getItem('token')); // for holding user's token
    
    const [ user, setUser ] = useState(() => {

        try{

            const u = localStorage.getItem('user');
            // console.log('Raw user from localStorage: ', u);
            return u ? JSON.parse(u) : null;

        }

        catch{
            return null;
        }

    }); // holds user's name, email, role


    function login(token, userData){

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(token);
        setUser(userData);

    }


    function logout(){

        localStorage.clear();
        setToken(null);
        setUser(null);

    }

    
    return(

        <AuthContext.Provider value={ { token, user, login, logout, isAdmin: user?.role === 'admin'} }>
            {children}
        </AuthContext.Provider>

    );
}


// custom Hook (useAuth)
// creating custom hook --> so that a component doesn't need to import both useContext and AuthContext

export function useAuth(){

    const ctx = useContext(AuthContext);

    if(!ctx){
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return ctx;
}