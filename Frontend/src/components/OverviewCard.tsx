import './CSS/OverviewCard.css';

interface OverviewCardProps{
    title: string;
    value: number;
    subtitle: string;
}

export default function OverviewCard({title, value, subtitle}: OverviewCardProps) {
  return (
    <div className='overviewCard'>
        <p className='overviewCardTitle'>{title}</p>
        <h3 className='overviewCardValue'>{value}</h3>
        <p className='overviewCardSubtitle' >{subtitle}</p>
    </div>
  )
}
