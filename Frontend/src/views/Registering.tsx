import { useState } from "react";
import "./CSS/LoginPage.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../ts/types/AuthContext.tsx";
import type { loginResponse } from "../ts/types/userTypes";

interface RegisterPageProps{
	registerApiCall: (email: string, userName: string, password: string) => Promise<loginResponse>
}

function RegisteringPage({registerApiCall}: RegisterPageProps) {
    const navigate = useNavigate();
	const { signIn } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUserName] = useState("");
    const [errorMessage, setErrorMessage]= useState<string>("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function funcRegister(email: string, userName: string, password: string) {
        if (isSubmitting) return;
		setIsSubmitting(true);
        try{
            const result = await registerApiCall(email, userName, password);
			signIn(result.accessToken);
            setErrorMessage("");
			navigate("/", { replace: true });
        }catch{
            setErrorMessage("Fel vid registrering");
        } finally {
			setIsSubmitting(false);
        }
	};

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		void funcRegister(email, username, password);
	}

return (
    <main className="loginPage">
        <section className="loginCard">
				<div className="loginBrand">
					<span className="loginBrandMark" aria-hidden="true">I</span>
					<div>
						<p className="loginEyebrow">INNOVIA</p>
						<h1 id="login-title">Register</h1>
						<p>Create your account to get started.</p>
					</div>
				</div>
			<form onSubmit={handleSubmit}>
            <div className="loginField">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    placeholder="Email"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                />
            </div>
            <div className="loginField">
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    autoComplete="username"
                    value={username}
                    placeholder="Username"
                    onChange={(event) => setUserName(event.target.value)}
                    required
                />
            </div>
            <div className="loginField">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    placeholder="Password"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                />
            </div>
            {errorMessage && <p className="errorText">{errorMessage}</p>}
			<div className="actionBtns">
			<button className="loginButton" type="submit" disabled={isSubmitting}>{isSubmitting ? "Registering..." : "Register"}</button>
			<Link to="/login" className="backBtn">Back</Link>
			</div>
			</form>
        </section>
    </main>
)
}

export default RegisteringPage
