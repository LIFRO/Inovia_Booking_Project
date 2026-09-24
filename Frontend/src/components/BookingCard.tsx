import './CSS/BookingCard.css'

interface BookingCardProps{
    id: number
    title: string,
    date: string,
    startTime: string
    endTime: string
    onCancel?: (id: number) => void,
    buttonText?: string
}




export default function BookingCard({id, title, date, startTime, endTime, buttonText = "Cancel" ,onCancel}: BookingCardProps) {

  return (
    <div className="bookingCard">
        <div>
            <h3 className="bookingTitle">{title}</h3>
            <p className="bookingTime">{date} {startTime} - {endTime}</p>
        </div>
            {onCancel && <button type="button" className="cancelBtn" onClick={() => onCancel(id)}>{buttonText}</button>}
    </div>
  )
}
