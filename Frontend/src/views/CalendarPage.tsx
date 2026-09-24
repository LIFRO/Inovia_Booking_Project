import { useEffect, useState } from "react";
import ReserveCard from "../components/ReserveCard"
import CalenderView from "./CalenderView"
import './CSS/CalendarPage.css'
import { apiGetAllResources } from "../ts/apiCalls/Resource";
import type { ResourceDto } from "../ts/dto/ResourceDTO";
import type { DayBoundariesExternal } from "@schedule-x/calendar";

export type ReserveModel = {
  selectedCategory: string,
  selectedResource: string,
  selectedDate: Temporal.PlainDate | null,
  selectedStartTime: Temporal.PlainTime | null,
  selectedEndTime: Temporal.PlainTime | null
}


export default function CalendarPage() {
  
  const dayBoundaries: DayBoundariesExternal = {
    start: '06:00',
    end: '18:00'
  }

  const [reserveModel, setReserveModel] = useState<ReserveModel>({
    selectedCategory: 'MeetingRoom',
    selectedDate: Temporal.Now.plainDateISO(),
    selectedEndTime: Temporal.PlainTime.from(dayBoundaries.end),
    selectedStartTime: Temporal.PlainTime.from(dayBoundaries.start),
    selectedResource: 'Mötesrum A'
  });

  const [allresources, setAllResources] = useState<ResourceDto[]>([])

  useEffect(() => {
    async function fetchResources() {
      const data =  await apiGetAllResources();
      setAllResources(data)
    }
    fetchResources()
    
  },[])

  
  const filteredCategory = allresources.filter(c => c.type === reserveModel.selectedCategory);


  return (
    <div className="calendarContent">
      <div className="calendarWrapper">
      <CalenderView 
        selectedResource={reserveModel.selectedResource} 
        selectedDate={reserveModel.selectedDate}
        dayBoundaries={dayBoundaries}
      />
      </div>
        <div className="reserveContent">
          <h3 className="reserveTitle">Reserve Resource</h3>
          <ReserveCard 
          reserveModel={reserveModel}
          setReserveModel={setReserveModel}
          resources={allresources} 
          filteredCategory={filteredCategory} 
          dayBoundaries={dayBoundaries}/>
        </div>
    </div>
  )
}
