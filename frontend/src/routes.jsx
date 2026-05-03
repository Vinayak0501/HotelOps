import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminTasks from './pages/admin/Tasks';
import Attendance from './pages/admin/Attendance';
import Performance from './pages/admin/Performance';
import Staff from './pages/admin/Staff';
import Rooms from './pages/admin/Rooms';
import StaffDashboard from './pages/staff/Dashboard';
import MyTasks from './pages/staff/MyTasks';
import Leave from './pages/staff/Leave';
import AdminLeaves from './pages/admin/Leaves';
import AttendanceHistory from './pages/staff/AttendanceHistory';


// creating a wrapper that checks user's id before letting them inside
// if random person tries to manually type admin in URL --> but aren't logclerged in --> throuwback to login page
function PrivateRoute({ children, role }){

    const { token, user } = useAuth();

    

    if(!token){
        return <Navigate to={"/login"} replace/>
        // replace --> replaces current history state
        // if replace not used --> a rejected user could click "Back" button on browser --> trigger the route again --> get kicked out again --> stuck in infinite "Back Button" loop.
    }

    if(role && user?.role !== role){
        return <Navigate to={'/login' } replace/>
    }

    // if route approved --> render the children props
    return children;

}


export default function AppRoutes(){

    return(

        <Routes>
            <Route path='/login' element= {<Login/>}/> 

            {/* admin */}
            <Route path='/admin' element = {<PrivateRoute role= "admin" >
                <AdminDashboard/>
            </PrivateRoute>}/>

            <Route path='/admin/tasks' element = {<PrivateRoute role= "admin" >
                <AdminTasks/>
            </PrivateRoute>}/>

            <Route path='/admin/attendance' element = {<PrivateRoute role= "admin" >
                <Attendance/>
            </PrivateRoute>}/>

            <Route path='/admin/performance' element = {<PrivateRoute role= "admin" >
                <Performance/>
            </PrivateRoute>}/>

            <Route path='/admin/staff' element = {<PrivateRoute role= "admin" >
                <Staff/>
            </PrivateRoute>}/>

            <Route path='/admin/rooms' element = {<PrivateRoute role= "admin" >
                <Rooms/>
            </PrivateRoute>}/>

            <Route path='/admin/leaves' element = {<PrivateRoute role= "admin" >
                <AdminLeaves/>
            </PrivateRoute>}/>



            {/* staff */}
            <Route path='/staff' element = {<PrivateRoute role= "staff" >
                <StaffDashboard/>
            </PrivateRoute>}/>

            <Route path='/staff/tasks' element = {<PrivateRoute role= "staff" >
                <MyTasks/>
            </PrivateRoute>}/>

            <Route path='/staff/leave' element = {<PrivateRoute role= "staff" >
                <Leave/>
            </PrivateRoute>}/>

            <Route path='/staff/attendance' element = {<PrivateRoute role= "staff" >
                <AttendanceHistory/>
            </PrivateRoute>}/>

            {/* fallbacks */}
            <Route path='/' element = {<Navigate to="/login" replace/>}/>
            <Route path='*' element = {<Navigate to="/login" replace/>}/>
        </Routes>
    )
}