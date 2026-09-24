import { useEffect, useState } from 'react';
import './CSS/AdminPage.css'
import SummaryCard from '../components/SummaryCard';
import BookingSummary from '../components/BookingSummary';
import { apiDeleteBooking, apiGetAllBookings } from '../ts/apiCalls/Booking';
import { useAuth } from '../ts/types/AuthContext';
import { useBookingEvents } from '../ts/useBookingEvents';
import Popup from '../components/Popup';
import RegisteringPage from './Registering';
import { apiRegisterAdmin } from '../ts/apiCalls/Admin';


interface AdminDataProps{
    id: number
    title: string
}

export type Status = "Booked";


type BookingRowDataProps = {
    id: number,
    userName: string,
    date: string,
    startTime: string,
    endTime: string,
    resourceName: string,
    status: Status
}

export default function AdminPage() {
    const { userId,userRole } = useAuth();
    const [bookingRow, setBookingRow] = useState<BookingRowDataProps[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [endDate, setEndDate] = useState<string>();
    const [startDate, setStartDate] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [isOpen, setIsOpen] = useState(false);

    useBookingEvents(
    {
        onCreated: (b) => {
            setBookingRow(prev => [...prev, { ...b, status: "Booked" as Status }]);
        },
        onCancelled: (b) => {
            setBookingRow(prev => prev.filter(booking => booking.id !== b.id));
        },
        onDeleted: (b) => {
            setBookingRow(prev => prev.filter(booking => booking.id !== b.id));
        },
    },
    userId,
    userRole === "Admin",
);


const filteredBookings = bookingRow.filter(booking => {
    const matchSearch = booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.resourceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDates = (!startDate || booking.date >= startDate) && (!endDate || booking.date <= endDate);
    return matchSearch && matchDates;
})
    const today = new Date().toISOString().split("T")[0];
    const bookingsToday = bookingRow.filter(booking => booking.date === today).length;
    const [summary] = useState<AdminDataProps[]>([
    {id: 1, title: "Total Bookings Today"}
    ]);

    async function handleDelete(id: number){
        try{
            await apiDeleteBooking(id);
            setBookingRow(bookingRow.filter(booking => booking.id !== id))
        }catch{
            console.error("Failed to delete booking");
            setErrorMessage("Kunde inte ta bort bokningen");
        }
    }
    
    useEffect(() => {
        
        async function fetchBookings() {
            const data = await  apiGetAllBookings();
            const withStatus = data.map(booking => ({
                ...booking, status: "Booked" as Status
            }));
            
                setBookingRow(withStatus)
        }
        fetchBookings();
    },[])

        useEffect(() => {

        if(errorMessage !== ""){
            const timerError = setTimeout(() => (setErrorMessage("")),3000)
            return () => {
            clearTimeout(timerError)
        }
        }},[errorMessage])

  return (
    <div className='summaryContent'>
             <div className='summaryHeader'>
                 <h2>System Activity Summary</h2>
                 <button className='adminButton' onClick={() => setIsOpen(true)}>+ New Admin</button>
             </div>
       <Popup 
            children={<RegisteringPage registerApiCall={apiRegisterAdmin}/>}
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
        />
       <div className='summaryCardContent'>
        {summary.map(item => ( 
        <SummaryCard 
        key={item.id}
        title={item.title}
        value={bookingsToday}
        />
        ))}
        </div>
       <div className='filterStatus'>
        <input type="text" className='filterControl'  placeholder='Search Employee or Room' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
        <input type="date" value={startDate ?? ""} onChange={(e) => setStartDate(e.target.value)} className='filterControl'/>
        <input type="date" value={endDate ?? ""} onChange={(e) => setEndDate(e.target.value)} className='filterControl'/>
       </div>
       <table>
        <thead>
            <tr>
            <th>EMPLOYEE</th>
            <th>BOOKING DATE</th>
            <th>TIME SLOT</th>
            <th>RESOURCE BOOKED</th>
            <th>STATUS</th>
            <th>ACTIONS</th>
            </tr>
        </thead>
        <tbody>
            {filteredBookings.map(booking => (
                <BookingSummary
                key={booking.id}
                id={booking.id}
                userName={booking.userName}
                date={booking.date}
                startTime={booking.startTime}
                endTime={booking.endTime}
                resourceName={booking.resourceName}
                status={booking.status}
                onDelete={handleDelete}
                />
            ))}
        </tbody>
       </table>
            <div className='toast'>
            {errorMessage && <p className='errorText'>{errorMessage}</p>}
        </div>
    </div>
  )
}
