import { useEffect, useState } from 'react'
import './CSS/ReserveCard.css'
import type { ReserveModel } from '../views/CalendarPage'
import type { ResourceDto } from '../ts/dto/ResourceDTO'
import { apiCreateBooking } from '../ts/apiCalls/Booking'
import { useAuth } from '../ts/types/AuthContext'
import type { BookingDto } from '../ts/dto/BookingDto'
import { endTimes } from '../ts/bookingTimes'



interface CategoryProps {
    reserveModel: ReserveModel
    setReserveModel: React.Dispatch<React.SetStateAction<ReserveModel>>
    resources: ResourceDto[],
    filteredCategory: ResourceDto[],
    availableSlots: string[]
    startTime: string
    onStartTimeChange: (time: string) => void
    availabilityError: string
    loading: boolean
    onBookingCreated: (booking: BookingDto) => void
}

export default function ReserveCard({
    resources, 
    filteredCategory, 
    reserveModel, 
    setReserveModel, 
    availableSlots,
    startTime,
    onStartTimeChange,
    availabilityError,
    loading,
    onBookingCreated}: CategoryProps) {
    
    const authContext = useAuth();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [endSelection, setEndSelection] = useState({ date: '', resource: '', start: '', end: '' })

    const selectedStartTime = availableSlots.includes(startTime) ? startTime : availableSlots[0] ?? ''
    const endOptions = endTimes(selectedStartTime, availableSlots)
    const selectedEndTime = endSelection.date === reserveModel.selectedDate &&
        endSelection.resource === reserveModel.selectedResource &&
        endSelection.start === selectedStartTime && endOptions.includes(endSelection.end)
        ? endSelection.end : endOptions[0] ?? ''

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
    if(!reserveModel.selectedDate || !selectedStartTime || !selectedEndTime || loading || availabilityError){
        setErrorMessage("Please fill in all fields")
        setSuccessMessage("");
        return
    }
    
    const foundResource = filteredCategory.find(resource => resource.name === reserveModel.selectedResource)
    if(!foundResource)
        return;

    try {
        const booking = await apiCreateBooking({
            date: reserveModel.selectedDate,
            endTime: selectedEndTime,
            startTime: selectedStartTime,
            name: authContext.userName,
            resourceId: foundResource.id
        })
        onBookingCreated(booking)
        setErrorMessage("");
        setSuccessMessage("Booking Confirmed");
    } catch {
        setSuccessMessage("");
        setErrorMessage("Could not book this time. Please try another slot.")
    }
}

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
        <input id='dateValue' type="date" className='timeValue' value={reserveModel.selectedDate} onChange={(e) => setReserveModel({
            ...reserveModel,
            selectedDate: e.target.value
        })}/>
        <div className='timeContent'>
            <div className='timeGroup'>
                <label htmlFor="startTime">Start Time</label>
                <select id='startTime' className='timeValue' value={selectedStartTime}
                    disabled={loading || !!availabilityError || !availableSlots.length}
                    onChange={(e) => onStartTimeChange(e.target.value)}>
                    {!selectedStartTime && <option value="">No times available</option>}
                    {availableSlots.map(time =>
                        <option key={time} value={time}>{time}</option>
                    )}
                </select>
            </div>
            <div className='timeGroup'>
                <label htmlFor="endTime">End Time</label>
                <select id='endTime' className='timeValue' value={selectedEndTime}
                    disabled={loading || !!availabilityError || !endOptions.length}
                    onChange={(e) => setEndSelection({
                        date: reserveModel.selectedDate,
                        resource: reserveModel.selectedResource,
                        start: selectedStartTime,
                        end: e.target.value,
                    })}>
                    {!selectedEndTime && <option value="">No times available</option>}
                    {endOptions.map(time =>
                        <option key={time} value={time}>{time}</option>
                    )}
                </select>
            </div>
        </div>
        {(loading || availabilityError || !availableSlots.length) &&
            <p className='availabilityMessage' role="status">
                {loading ? 'Loading available times…' : availabilityError ||
                    (!reserveModel.selectedDate ? 'Select a date.' : 'No available times for this day.')}
            </p>}
        <div className='confirmContent'>
        <button type='button' className='confirmBtn' onClick={handleConfirm}
            disabled={loading || !!availabilityError || !selectedEndTime}>+ Confirm Booking</button>
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
