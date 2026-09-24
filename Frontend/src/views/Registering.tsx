import { useState } from "react";
import { apiRegister } from "../ts/apiCalls/User.tsx";
import "./CSS/LoginPage.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

interface RegisterPageProps{
	registerApiCall: (email: string, userName: string, password: string) => Promise<any>
}

function RegisteringPage({registerApiCall}: RegisterPageProps) {
    const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUserName] = useState("");
    const [errorMessage, setErrorMessage]= useState<string>("");
    const [successMessage, setSuccessMessage] = useState<string>("");

	async function funcRegister(email: string, userName: string, password: string) {
        try{
            const result = await registerApiCall(email, userName, password);
            setErrorMessage("");
            setSuccessMessage("Registrering lyckades");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
            return result;
            

        }catch(error){
            setErrorMessage("Fel vid registrering");
        }
	};

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
            <div className="loginField">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    value={email}
                    placeholder="Email"
                    onChange={(event) => setEmail(event.target.value)}
                />
            </div>
            <div className="loginField">
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    value={username}
                    placeholder="Username"
                    onChange={(event) => setUserName(event.target.value)}
                />
            </div>
            <div className="loginField">
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="Password"
                    onChange={(event) => setPassword(event.target.value)}
                />
            </div>
            {successMessage && <p className="successText">{successMessage}</p>}
            {errorMessage && <p className="errorText">{errorMessage}</p>}
			<div className="actionBtns">
            <button className="loginButton" onClick={() => { funcRegister(email, username, password) }}>Register</button>
			<Link to="/login" className="backBtn">Back</Link>
			</div>
        </section>
    </main>
)
}

export default RegisteringPage
