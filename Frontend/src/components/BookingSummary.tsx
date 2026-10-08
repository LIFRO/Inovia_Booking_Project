import './CSS/BookingSummary.css'

interface BookingSummaryProps{
    id: number,
    userName: string,
    date: string,
    startTime: string,
    endTime: string,
    resourceName: string,
    onDelete: (id: number) => void;
}


export default function BookingSummary({id, userName, date, startTime, endTime, resourceName, onDelete}: BookingSummaryProps) {
  
    return (
        <tr className='SummaryCard'>
            <td data-label="Employee">
                <div className="employeeEmail">{userName}</div></td>
            <td data-label="Booking date">{date}</td>
            <td data-label="Time slot">{startTime} - {endTime}</td>
            <td data-label="Resource">
                <span className='resourceBooked'>{resourceName}</span></td>
            <td data-label="Status">
                <span className="statusBooked">Booked</span>
            </td>
            <td data-label="Actions"><button type='button' onClick={() => onDelete(id)} className='deleteBtn'>Delete</button></td>
        </tr>

  )
}
