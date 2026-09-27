import { useEffect, useState } from 'react'
import './CSS/ReserveCard.css'
import type { ReserveModel } from '../views/CalendarPage'
import type { ResourceDto } from '../ts/dto/ResourceDTO'
import { apiCreateBooking } from '../ts/apiCalls/Booking'
import { useAuth } from '../ts/types/AuthContext'
import type { BookingDto } from '../ts/dto/BookingDto'
import { endTimes } from '../ts/bookingTimes'
import axios from 'axios'



interface CategoryProps {
    reserveModel: ReserveModel
    setReserveModel: React.Dispatch<React.SetStateAction<ReserveModel>>
    resources: ResourceDto[],
    filteredCategory: ResourceDto[],
    availableSlotsByResource: Record<number, string[]>
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
    availableSlotsByResource,
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
    const [submitting, setSubmitting] = useState(false)
    const [showAvailableOnly, setShowAvailableOnly] = useState(false)
    const [endSelection, setEndSelection] = useState({ date: '', resource: '', start: '', end: '' })

    const visibleResources = showAvailableOnly
        ? filteredCategory.filter(resource => (availableSlotsByResource[resource.id]?.length ?? 0) > 0)
        : filteredCategory
    const selectedResourceVisible = visibleResources.some(resource => resource.name === reserveModel.selectedResource)
    const resourceSlots = selectedResourceVisible ? availableSlots : []
    const selectedStartTime = resourceSlots.includes(startTime) ? startTime : resourceSlots[0] ?? ''
    const endOptions = endTimes(selectedStartTime, resourceSlots)
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
    if (submitting) return
    if(!reserveModel.selectedDate || !selectedStartTime || !selectedEndTime || loading || availabilityError){
        setErrorMessage("Please fill in all fields")
        setSuccessMessage("");
        return
    }
    
    const foundResource = visibleResources.find(resource => resource.name === reserveModel.selectedResource)
    if(!foundResource)
        return;

    setSubmitting(true)
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
    } catch (error) {
        setSuccessMessage("");
        const serverMessage = axios.isAxiosError(error) && typeof error.response?.data === 'string'
            ? error.response.data : ''
        setErrorMessage(serverMessage || (axios.isAxiosError(error) && error.response?.status === 401
            ? 'Your session has expired. Please sign in again.'
            : 'Could not book this time. Please try again.'))
    } finally {
        setSubmitting(false)
    }
}

    const categoryFilter = resources.map((c) => c.type);
    const categoryOptions =[...new Set(categoryFilter)]
    const freeCount = (category: string) => resources.filter(resource =>
        resource.type === category && (availableSlotsByResource[resource.id]?.length ?? 0) > 0
    ).length
    const selectedResource = filteredCategory.find(resource => resource.name === reserveModel.selectedResource)
    const selectedFreeTimes = selectedResource ? availableSlotsByResource[selectedResource.id]?.length ?? 0 : 0

  return (
    <div className='reserveCard'>
        <label htmlFor="categoryType">Category</label>
        <select id="categoryType" className='selectValue' value={reserveModel.selectedCategory} onChange={(e) => {
            setReserveModel({
                ...reserveModel,
                selectedCategory: e.target.value,
                selectedResource: resources.find(resource => resource.type === e.target.value &&
                    (!showAvailableOnly || (availableSlotsByResource[resource.id]?.length ?? 0) > 0))?.name ?? ''
            })
        }
        }>
            {
                categoryOptions.map(cat => (
                    <option 
                    key={cat}
                    value={cat}>{cat}{!loading && !availabilityError
                        ? ` (${freeCount(cat) === 0 ? 'None available' : `${freeCount(cat)} available`})` : ''}</option>
                ))
            }
        </select>

        <label className="availabilityFilter">
            <input type="checkbox" checked={showAvailableOnly} onChange={(e) => {
                const onlyAvailable = e.target.checked
                setShowAvailableOnly(onlyAvailable)
                if (onlyAvailable && !filteredCategory.some(resource =>
                    resource.name === reserveModel.selectedResource && (availableSlotsByResource[resource.id]?.length ?? 0) > 0)) {
                    setReserveModel(model => ({ ...model, selectedResource: filteredCategory.find(resource =>
                        (availableSlotsByResource[resource.id]?.length ?? 0) > 0)?.name ?? '' }))
                } else if (!onlyAvailable && !reserveModel.selectedResource) {
                    setReserveModel(model => ({ ...model, selectedResource: filteredCategory[0]?.name ?? '' }))
                }
            }} disabled={loading || !!availabilityError} />
            Show only resources with free times
        </label>

        <label htmlFor="resourceType">Resource</label>
        <select id='resourceType' className='selectValue' value={selectedResourceVisible ? reserveModel.selectedResource : ''} onChange={(e) => setReserveModel({
            ...reserveModel,
            selectedResource: e.target.value,
        })}>
         {!selectedResourceVisible && <option value="">{visibleResources.length ? 'Choose a resource' :
             showAvailableOnly ? 'No resources with free times' : 'No resources in this category'}</option>}
         {visibleResources.map(item => (
            <option
            key={item.id}
            value={item.name}
            title={item.name}>
            {item.name}{!loading && !availabilityError ? ` — ${availableSlotsByResource[item.id]?.length ?? 0} free ${availableSlotsByResource[item.id]?.length === 1 ? 'time' : 'times'}` : ''}</option>
         ))}
        </select>
        {!loading && !availabilityError && selectedResourceVisible &&
            <p className='availabilityMessage' role="status">
                {selectedFreeTimes === 0 ? 'No free times for this resource on the selected date.' :
                    `${selectedFreeTimes} free ${selectedFreeTimes === 1 ? 'time' : 'times'} for this resource on the selected date.`}
            </p>}

        <label htmlFor="dateValue">Date</label>
        <input id='dateValue' type="date" className='timeValue' value={reserveModel.selectedDate} onChange={(e) => setReserveModel({
            ...reserveModel,
            selectedDate: e.target.value
        })}/>
        <div className='timeContent'>
            <div className='timeGroup'>
                <label htmlFor="startTime">Start Time</label>
                <select id='startTime' className='timeValue' value={selectedStartTime}
                    disabled={loading || !!availabilityError || !resourceSlots.length}
                    onChange={(e) => onStartTimeChange(e.target.value)}>
                    {!selectedStartTime && <option value="">No times available</option>}
                    {resourceSlots.map(time =>
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
        {(loading || availabilityError || !selectedResourceVisible) &&
            <p className='availabilityMessage' role="status">
                {loading ? 'Loading available times…' : availabilityError ||
                    (!reserveModel.selectedDate ? 'Select a date.' : 'Choose a resource with free times.')}
            </p>}
        <div className='confirmContent'>
        <button type='button' className='confirmBtn' onClick={handleConfirm}
            disabled={loading || submitting || !!availabilityError || !selectedEndTime}>{submitting ? 'Booking…' : '+ Confirm Booking'}</button>
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
