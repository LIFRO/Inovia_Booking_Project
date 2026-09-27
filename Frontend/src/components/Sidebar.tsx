import './CSS/Sidebar.css';
import logo from '../assets/logo.svg'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../ts/types/AuthContext';
import { connection } from '../ts/signalr';


interface SideBarProps {
    userName: string;
}



export default function SideBar({userName}: SideBarProps) {
    const navigate = useNavigate()
    const {userRole, signOut} = useAuth();
    const location = useLocation();


    const handleLogout =()=> {
        void connection.stop();
        signOut();
        navigate("/login");
    }

  return (
        <div className="sidebar">
            <img src={logo} alt="Innovia Hub" className='sidebarLogo' />
            <nav >

                <ul>
                    <li>
                        <Link to="/" className={location.pathname === "/" ? "sidebarLink sidebarLinkActive" : "sidebarLink"}>Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/calendar" className={location.pathname === "/calendar" ? "sidebarLink sidebarLinkActive" : "sidebarLink"}>Calendar</Link>
                    </li>

                    {userRole === "Admin" && (
                                            <li>
                        <Link to="/admin" className={location.pathname === "/admin" ? "sidebarLink sidebarLinkActive" : "sidebarLink"}>Bookings</Link>
                    </li>
                    )}
                        
                </ul>
            </nav>
            <div className='logoutContainer'>
            <button className='logoutBtn' onClick={handleLogout}>Logout</button>
            </div>
            <div className='sidebarUser'>
                <h3>{userName}</h3>
            </div>
        </div>
  )
}
