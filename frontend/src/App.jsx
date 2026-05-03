import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes";
import './styles/global.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/login.css';
import './styles/tasks.css';

export default function App(){

  return(

    <BrowserRouter>
      <AppRoutes/>
    </BrowserRouter>
  );

}