import axios from "axios";
import type { BookingDto } from "../dto/BookingDto";
import type { CreateBookingDto } from "../dto/CreateBookingDto";
import type { WeeklyTimeDto } from "../dto/WeeklyTimeDto";

export async function apiGetAllBookings(): Promise<BookingDto[]> {
    const token = localStorage.getItem("token");

    const response = await axios.get<BookingDto[]>("/api/booking/all", {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data;
}

export async function apiGetWeeklyTimes(date: string): Promise<WeeklyTimeDto[]> {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Sign in to view available times.");
    const response = await axios.get<WeeklyTimeDto[]>("/api/booking/weekly-times", {
        params: { date },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function apiGetMyBookings(): Promise<BookingDto[]> {
    const token = localStorage.getItem("token");

    const response = await axios.get<BookingDto[]>("/api/booking", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data;
}

export async function apiCreateBooking(dto: CreateBookingDto): Promise<BookingDto> {
    const token = localStorage.getItem("token");

    const response = await axios.post<BookingDto>("/api/booking", {
        ...dto,
        startTime: dto.startTime.length === 5 ? `${dto.startTime}:00` : dto.startTime,
        endTime: dto.endTime.length === 5 ? `${dto.endTime}:00` : dto.endTime,
    }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    return response.data;
}

export async function apiDeleteBooking(id: number) {
    const token = localStorage.getItem("token");
    await axios.delete(`/api/booking/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
}
