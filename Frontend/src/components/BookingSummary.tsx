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
            <td>    
                <div className="employeeEmail">{userName}</div></td>
            <td>{date}</td>
            <td>{startTime} - {endTime}</td>
            <td>
                <span className='resourceBooked'>{resourceName}</span></td>
            <td>
                <span className="statusBooked">Booked</span>
            </td>
            <td><button type='button' onClick={() => onDelete(id)} className='deleteBtn'>Delete</button></td>
        </tr>

  )
}
