import axios from "axios";

export async function apiRegisterAdmin(email: string, userName: string, password: string) {
	const token = localStorage.getItem("token");
	
	const response = await axios.post("/api/admin/register", {
		email: email,
		userName: userName,
		password: password
	}, {
		headers: token ? { Authorization: `Bearer ${token}` } : undefined
	});

	console.log(response.data);

	return response.data;
}