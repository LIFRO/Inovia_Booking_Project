import { Outlet } from "react-router-dom";
import SideBar from "../components/Sidebar";
import Header from "../components/Header"
import { useAuth } from "../ts/types/AuthContext";

import './CSS/MainLayout.css';



export default function MainLayout() {
  const {userName} = useAuth();
 



  return (
    <div className="dashboardMain">
        <SideBar userName={userName} />
        <div className="mainContent">
            <Header userName={userName}/>
            <Outlet/>
        </div>
    </div>
  )
}
