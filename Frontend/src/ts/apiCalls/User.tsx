import axios from "axios";
import type { loginResponse } from "../types/userTypes";

export async function apiLogin(userName: string, password: string) {
	const response = await axios.post<loginResponse>("/api/user/login", {
		userName: userName,
		password: password
	});

	console.log(response.data);

	return response.data;
}

export async function apiRegister(email: string, userName: string, password: string) {
	const response = await axios.post("/api/user/register", {
			email: email,
			userName: userName,
			password: password
	
	});

	console.log(response.data);

	return response.data;
}
