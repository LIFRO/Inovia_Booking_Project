export type user = {
	id: number;
	email: string;
	userName: string;
	password: string;
}

export type userRegistering = Omit<user, "id">;

export type userLoggin = Omit<user, "id" | "email">;


export type loginResponse = {
	accessToken: string,
	userName: string;
}
