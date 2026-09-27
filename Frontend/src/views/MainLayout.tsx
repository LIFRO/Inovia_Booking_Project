import { Outlet, useLocation } from "react-router-dom";
import SideBar from "../components/Sidebar";
import Header from "../components/Header"
import { useAuth } from "../ts/types/AuthContext";

import './CSS/MainLayout.css';



export default function MainLayout() {
  const {userName} = useAuth();
  const location = useLocation();
 



  return (
    <div className="dashboardMain">
        <SideBar userName={userName} />
        <div className="mainContent">
            {location.pathname !== '/calendar' && <Header userName={userName}/>}
            <Outlet/>
        </div>
    </div>
  )
}
