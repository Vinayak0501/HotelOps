import { useState, useEffect, useCallback } from "react";
import { getMyTasks } from "../api/task.api";

export function useTasks(){

    const [ tasks, setTasks ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);


    const fetch = useCallback(async function (silent = false) {
        
        if(!silent)
        setLoading(true);

        try{

            const res = await getMyTasks();
            setTasks(res.data);
            setError(null);

        }

        catch(err){

            setError(err.response?.data?.message || 'Failed to load tasks');

        }

        finally{
            if(!silent)
            setLoading(false);
        }
    }, []);


    useEffect(() => { fetch(); 

        const interval = setInterval(() => fetch(true), 30000);

        return () => clearInterval(interval);
    }, 
    [fetch]);
    // as soon as the component using this hook (useTasks) appear on the screen --> run fetch function
    // fetch --> memoized using useCallback --> put as a dependency

    return { tasks, loading, error, refetch: () => fetch(true) };
    // refetch --> suppose a user click's "mark task complete" button --> instead of writing complex logic to delete that task from tasks array in memory --> just call refetch()
    // triggers the hook to run API call again --> fetch updated task list from DB
}