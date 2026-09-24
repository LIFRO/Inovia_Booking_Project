import axios from "axios";
import type { ResourceDto } from "../dto/ResourceDTO";
import type { ResourceAvailabilityDto } from "../dto/ResourceAvailabilityDto";

export async function apiGetAllResources(): Promise<ResourceDto[]>{
    const token = localStorage.getItem("token");

    const response = await axios.get<ResourceDto[]>("/api/Resource", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
return response.data
}

export async function apiGetResourceAvailability(): Promise<ResourceAvailabilityDto[]> {
    const token = localStorage.getItem("token");
    const response = await axios.get<ResourceAvailabilityDto[]>("/api/resource/availability", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return response.data;
}