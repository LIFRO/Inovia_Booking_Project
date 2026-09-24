import './CSS/HourlyTimePicker.css'

interface HourlyTimePickerProps{
    onChange: (value: string) => void,
    maxDisplayedTime: Temporal.PlainTime,
    minDisplayedTime: Temporal.PlainTime,
    value: string,
    id: string,
    className: string
}
export default function HourlyTimePicker({
    onChange,
    maxDisplayedTime,
    minDisplayedTime,
    value,
    id,
    className
}: HourlyTimePickerProps){
    const minHour = parseInt(minDisplayedTime.toString().split(':')[0], 10);
    const maxHour = parseInt(maxDisplayedTime.toString().split(':')[0], 10)
    const normalizedValue = value ? value.slice(0, 5) : '';

    const hourlyOptions = Array.from({length: 24 }, (_, i) => i)
    .filter(hour => hour >= minHour && hour <= maxHour)
    .map(hour => {
        const formattedHour = String(hour).padStart(2, '0');
        return `${formattedHour}:00`;
    })


    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if(!value) return;
        onChange(value)
    }

    return(
        <select 
        onChange={handleChange}
        value={normalizedValue}
        id={id}
        className={className}
        >
            {
                hourlyOptions.map(time => (
                    <option key={time} value={time}>
                        {time}
                    </option>
                ))
            }
        </select>
    )
}
