import './CSS/DashboardPage.css'
import ResourcesCard from "../components/ResourceCard"
import hotDesksImg from '../assets/hot-desks.jpg';
import boardroomImg from '../assets/boardroom.jpg';
import vrHeadsetImg from '../assets/vr-headset.jpg';
import aiServerImg from '../assets/ai-server.jpg'
import BookingCard from "../components/BookingCard"
import { useState, useEffect } from "react"
import { apiGetMyBookings, apiDeleteBooking } from "../ts/apiCalls/Booking"
import { apiGetResourceAvailability } from "../ts/apiCalls/Resource"
import type { BookingDto } from "../ts/dto/BookingDto"
import type { ResourceAvailabilityDto } from "../ts/dto/ResourceAvailabilityDto"

const RESOURCE_TYPE_INFO: Record <string, { title: string; image: string }> = {
    Desk: { title: "Dedicated Hot Desks", image: hotDesksImg },
    MeetingRoom: { title: "Collaborative Boardroom", image: boardroomImg },
    VRHeadset: { title: "VR Headset", image: vrHeadsetImg },
    AIServer: { title: "AI Server", image: aiServerImg },
}

function getAvailabilityStatus(available: number, total: number) {
    if (available === 0) return "Fully Booked"
    if (available <= total * 0.3) return "Limited Space"
    return "Available"
}


export default function DashboardPage() {

    const [bookings, setBookings] = useState<BookingDto[]>([]);
    const [availability, setAvailability] = useState<ResourceAvailabilityDto[]>([]);

    useEffect(() => {
        apiGetMyBookings().then(setBookings).catch(console.error);
        apiGetResourceAvailability().then(setAvailability).catch(console.error);
    }, []);


    async function handleCancel(id: number){
        try {
            await apiDeleteBooking(id);
            setBookings(bookings.filter(booking => booking.id !== id));
        } catch {
            console.error("Failed to cancel booking");
        }
    }

  return (
    <div className="dashboardContent">
        <div className="contentRow">
        <div className="exploreResources">
            <h2>Explore All Resources</h2>
                <div className="recourceCards" >
                    {availability.map(item => (
                        <ResourcesCard
                        key={item.type}
                        image={RESOURCE_TYPE_INFO[item.type]?.image}
                        title={RESOURCE_TYPE_INFO[item.type]?.title ?? item.type}
                        totalValue={item.total}
                        freeValue={item.available}
                        available={getAvailabilityStatus(item.available, item.total)}
                        to={`/calendar?category=${encodeURIComponent(item.type)}`}
                        />
                    ))}
            </div>
        </div>
        <div className='bookingsColumn'>
        <div className="myBookings">
            <h2>My Bookings</h2>
            {bookings.map(booking => (
                <BookingCard 
                key={booking.id}
                id={booking.id}
                title={booking.resourceName}
                date={booking.date}
                startTime={booking.startTime}
                endTime={booking.endTime}
                onCancel={handleCancel}
                />
            ))}
            </div>
            </div>
        </div>
</div>
  )
}
