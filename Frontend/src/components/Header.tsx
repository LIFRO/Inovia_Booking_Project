import './CSS/Header.css';
import { Link } from 'react-router-dom';

interface HeaderProps {
    userName: string;
}



export default function Header({userName}: HeaderProps) {

  return (
        <header className='header'>
            <h1>Welcome, {userName}</h1>
            <div className='headerBtn'>
                <Link to="/calendar" state={{ openBooking: true }} className='bookingBtn'>+ New Booking</Link>
            </div>
        </header>
  )
}
