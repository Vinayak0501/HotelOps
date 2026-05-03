import { useState, useEffect, useCallback } from "react";
import { getAllStaff , getPerformance } from "../api/staff.api";


export function useStaff(){

    const [ staff, setStaff ] = useState([]);
    const [ loading , setLoading ] = useState(true);
    const [ error , setError ] = useState(null);


    const fetch = useCallback(async function () {
        
        setLoading(true);

        try{

            const res = await getAllStaff();
            setStaff(res.data);
            setError(null);

        }

        catch(err){
            // console.log(err);
            setError(err.response?.data?.message || 'Failed to load all the staff members');
        }

        finally{
            setLoading(false);
        }

    }, []);


    useEffect(() => { fetch(); },
     [fetch]);

     return { staff, loading, error, refetch: fetch };

}


export function usePerformance(){

    const [ data, setData ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    const fetch = useCallback(async function () {
        
        setLoading(true);

        try{

            const res = await getPerformance();
            setData(res.data);
            setError(null);

        }

        catch(err){
            setError(err.response?.data?.message || 'Faied to load performance metrics');
        }

        finally{
            setLoading(false);
        }

    },[]);

    useEffect(() => {fetch();},[fetch]);

    return { data, loading, error, refetch:fetch };
}