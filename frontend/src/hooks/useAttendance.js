// hook to get attendance
import { useState, useEffect, useCallback } from "react";
import { getTodayAttendance } from "../api/attendance.api";

export function useAttendance(){

    const [ data, setData ] = useState(null);
    const [ loading, setLoading ] = useState(true);
    const [ error, setError ] = useState(null);

    const fetch = useCallback(async function () {
        
        setLoading(true);

        try{

            const res = await getTodayAttendance();
            setData(res.data);
            setError(null);

        }

        catch(err){
            setError(err.response?.data?.message || 'Failed to get today attendance');
        }

        finally{
            setLoading(false);
        }

    },[]);


    useEffect(() => { fetch(); },
    [ fetch ]);

    return { data, loading, error, refetch: fetch };
}