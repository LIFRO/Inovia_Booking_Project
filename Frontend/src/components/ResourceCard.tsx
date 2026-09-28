import './CSS/ResourceCard.css';
import { Link } from 'react-router-dom';

export type Available = "Available" | "Limited Space" | "Fully Booked"

interface ResourceCardProps{
  image: string,
  title: string,
  totalValue: number,
  freeValue: number
  available: Available
  to: string
}



function getStatusClass(status: Available){
  if(status === "Available") return "statusAvailable"
  if(status === "Limited Space") return "statusLimited"
  if(status === "Fully Booked") return "statusFullyBooked"
  
}


export default function ResourceCard({image, title, totalValue, freeValue, available, to}: ResourceCardProps) {
  return (
     <Link className='resourceCard' to={to} aria-label={`View ${title} in calendar`}>
        <img src={image} alt={title} className='resourceCardImage'/>
        <div className='cardContent'>
          <div className='cardHeader'>
            <h3 className='resourceCardTitle'>{title}</h3>
            <p className={`resourceCardAvailable ${getStatusClass(available)}`}>{available}</p> 
          </div>
            <div className='cardStats'>
              <div className='statGroup'>
                <p className='statLabel'>Total Units</p>
                <p className='resourceCardTotalValue'>{totalValue}</p>
                </div>
              <div className='statGroup'>
            <p className='statLabel'>Current Free</p>
            <p className='resourceCardFreeValue'>{freeValue}</p>
          </div>
        </div>
      </div>
    </Link>
  )
} 
