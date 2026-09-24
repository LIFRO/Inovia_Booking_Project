import { useEffect, useState } from 'react'
import './CSS/ReserveCard.css'
import type { ReserveModel } from '../views/CalendarPage'
import type { ResourceDto } from '../ts/dto/ResourceDTO'
import type { DayBoundariesExternal } from '@schedule-x/calendar'
import HourlyTimePicker from './HourlyTimePicker'
import { apiCreateBooking } from '../ts/apiCalls/Booking'
import { useAuth } from '../ts/types/AuthContext'



interface CategoryProps {
    reserveModel: ReserveModel
    setReserveModel: React.Dispatch<React.SetStateAction<ReserveModel>>
    resources: ResourceDto[],
    filteredCategory: ResourceDto[],
    dayBoundaries: DayBoundariesExternal
}

function toTemporalTime(time: string): string {
    const [hour, minute = '00'] = time.split(':')
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}


export default function ReserveCard({
    resources, 
    filteredCategory, 
    reserveModel, 
    setReserveModel, 
    dayBoundaries}: CategoryProps) {
    
    const authContext = useAuth();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

    useEffect(() => {
        if(successMessage !== ""){
            const timerSuccess = setTimeout(() => (setSuccessMessage("")),3000)
            return () => {
                clearTimeout(timerSuccess)
            }
        }
        if(errorMessage !== ""){
            const timerError = setTimeout(() => (setErrorMessage("")),3000)
            return () => {
                clearTimeout(timerError)
            }
        }

    },[successMessage, errorMessage])

    async function handleConfirm(){
    if(reserveModel.selectedDate === null || reserveModel.selectedStartTime === null || reserveModel.selectedEndTime === null){
        setErrorMessage("Please fill in all fields")
        setSuccessMessage("");
        return
    }
    
    const foundResource = filteredCategory.find(resource => resource.name === reserveModel.selectedResource)
    if(!foundResource)
        return;

    await apiCreateBooking({
        date: reserveModel.selectedDate.toString(),
        endTime: reserveModel.selectedEndTime.toString(),
        startTime: reserveModel.selectedStartTime.toString(),
        name: authContext.userName,
        resourceId: foundResource.id 
    })

    setErrorMessage("");
    setSuccessMessage("Booking Confirmed");
}
    //Logical relationship between start and end time
    const maxStartTime: string = reserveModel.selectedEndTime? 
    `${parseInt(reserveModel.selectedEndTime.toString().split(':')[0], 10) - 1}:00` :
    `${parseInt(dayBoundaries.end.toString().split(':')[0], 10) - 1}:00` 
    
    const minEndTime: string = reserveModel.selectedStartTime? 
    `${parseInt(reserveModel.selectedStartTime.toString().split(':')[0], 10) + 1}:00` : 
    `${parseInt(dayBoundaries.start.toString().split(':')[0], 10) + 1}:00`

    const categoryFilter = resources.map((c) => c.type);
    const categoryOptions =[...new Set(categoryFilter)]

  return (
    <div className='reserveCard'>
        <label htmlFor="categoryType">Category</label>
        <select id="categoryType" className='selectValue' value={reserveModel.selectedCategory} onChange={(e) => {
            setReserveModel({
                ...reserveModel,
                selectedCategory: e.target.value,
                selectedResource: resources.find((resource => resource.type === e.target.value))?.name ?? ''
            })
        }
        }>
            {
                categoryOptions.map(cat => (
                    <option 
                    key={cat}
                    value={cat}>{cat}</option>
                ))
            }
        </select>

        <label htmlFor="resourceType">Resource</label>
        <select id='resourceType' className='selectValue' value={reserveModel.selectedResource} onChange={(e) => setReserveModel({
            ...reserveModel,
            selectedResource: e.target.value,
        })}>
         {filteredCategory.map(item => (
            <option
            key={item.id}
            value={item.name}
            title={item.name}>
            {item.name}</option>
         ))}
        </select>

        <label htmlFor="dateValue">Date</label>
        <input id='dateValue' type="date" className='timeValue' value={reserveModel.selectedDate?.toString() ?? ''} onChange={(e) => setReserveModel({
            ...reserveModel,
            selectedDate: Temporal.PlainDate.from(e.target.value)
        })}/>
        <div className='timeContent'>
            <div className='timeGroup'>
                <label htmlFor="startTime">Start Time</label>
                <HourlyTimePicker 
                      id='startTime'
                      className='timeValue'
                      value={reserveModel.selectedStartTime?.toString() ?? ''}
                      minDisplayedTime={Temporal.PlainTime.from(toTemporalTime(dayBoundaries.start))}
                      maxDisplayedTime={Temporal.PlainTime.from(toTemporalTime(maxStartTime))}
                      onChange={(time: string) => setReserveModel({
                          ...reserveModel,
                          selectedStartTime: Temporal.PlainTime.from(time)
                      })}/>
            </div>
            <div className='timeGroup'>
                <label htmlFor="endTime">End Time</label>
                <HourlyTimePicker 
                    id='endTime' 
                    className='timeValue' 
                    value={reserveModel.selectedEndTime?.toString() ?? ''} 
                    minDisplayedTime={Temporal.PlainTime.from(toTemporalTime(minEndTime))}
                    maxDisplayedTime={Temporal.PlainTime.from(toTemporalTime(dayBoundaries.end))}
                    onChange={(time: string) => setReserveModel({
                        ...reserveModel,
                        selectedEndTime: Temporal.PlainTime.from(time)
                })}/>
            </div>
        </div>
        <div className='confirmContent'>
        <button type='button' className='confirmBtn' onClick={handleConfirm}>+ Confirm Booking</button>
        </div>
        {(successMessage || errorMessage) && (
        <div className='toast'>
            {errorMessage && <p className='errorText'>{errorMessage}</p>}
            {successMessage && <p className='successText'>{successMessage}</p>}
        </div>
        )}
    </div>
  )
}
