import './CSS/SummaryCard.css';

interface SummaryCardProps{
    title: string,
    value: number
}

export default function SummaryCard({title, value}: SummaryCardProps) {
    
  return (
    <div className='summaryCard'>
        <p className='summaryCardTitle'>{title}</p>
        <h3 className='summaryCardValue'>{value}</h3>
    </div>  
  )
}
