import { useState } from "react";
import { apiLogin } from "../ts/apiCalls/User.tsx";
import "./CSS/LoginPage.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../ts/types/AuthContext.tsx";




function LoginPage() {


	const navigate = useNavigate();
	const { signIn } = useAuth();
	const [password, setPassword] = useState("");
	const [username, setUserName] = useState("");
	const [errorMessage, setErrorMessage]= useState<string>("")

	async function funcLogin(userName: string, password: string) {
		try{
			const result = await apiLogin(userName, password);
			signIn(result.accessToken);
			setErrorMessage("");
			navigate("/")
		}catch{
			setErrorMessage("Fel användarnamn eller lösenord")

		}
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		await funcLogin(username, password);
	}

	return (
		<main className="loginPage">
			<section className="loginCard" aria-labelledby="login-title">
				<div className="loginBrand">
					<span className="loginBrandMark" aria-hidden="true">I</span>
					<div>
						<p className="loginEyebrow">INNOVIA</p>
						<h1 id="login-title">Welcome back</h1>
						<p>Sign in to manage your bookings and resources.</p>
					</div>
				</div>

				<form className="loginForm" onSubmit={handleSubmit}>
					<div className="loginField">
						<label htmlFor="username">Username</label>
						<input
							id="username"
							name="username"
							autoComplete="username"
							value={username}
							placeholder="Enter your username"
							onChange={(event) => setUserName(event.target.value)}
							required
						/>
					</div>
					<div className="loginField">
						<label htmlFor="password">Password</label>
						<input
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							value={password}
							placeholder="Enter your password"
							onChange={(event) => setPassword(event.target.value)}
							required
						/>
					</div>
					{errorMessage && <p className="errorText">{errorMessage}</p>}
					<button className="loginButton" type="submit">Sign in</button>
				</form>
				<p className="signUpText">Don´t have an organisation workspace yet? 
					<Link to="/register" className="signUpLink" > Sign up</Link>
					</p>
			</section>

		
		</main>
	)
}

export default LoginPage
