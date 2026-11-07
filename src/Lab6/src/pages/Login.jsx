import '../styles/Login.css';
import logo from '../assets/logo.png';
import background from '../assets/background.jpg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    
    function handleSubmit(event) {
        event.preventDefault();
        if (login === 'mark5' && password === 'mark5') {
            setError(false);
            document.cookie = "isAuthenticated=true; path=/; max-age=86400; SameSite=Lax";
            navigate('/dashboard');
        } else {
            setError(true);
        }
    }

    return (
        <div className="login-page">
            <img src={background} alt="" className="background-image" />
            <div className="login-card">

                <div className="login-logo">
                    <img src={logo} alt="Weatherly logo" />
                    <h1>Weatherly</h1>
                </div>

                <div className="login-header">
                    <h2>Раді тебе бачити!</h2>
                    <p>
                        Увійди, щоб переглянути
                        <br />
                        прогноз погоди <span>💙</span>
                    </p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px" fill="#1f1f1f"><path d="M9.18,10.83Q8,9.65 8,8T9.18,5.18T12,4t2.83,1.18T16,8t-1.17,2.82T12,12T9.18,10.83ZM4,20V17.2q0-0.85 0.44-1.56q0.44-0.71 1.16-1.09q1.55-0.78 3.15-1.16T12,13t3.25,0.39t3.15,1.16q0.72,0.38 1.16,1.09T20,17.2V20H4Zm2-2H18V17.2q0-0.27-0.14-0.5q-0.14-0.22-0.36-0.35q-1.35-0.68-2.72-1.01T12,15T9.23,15.34T6.5,16.35Q6.28,16.48 6.14,16.7Q6,16.93 6,17.2V18Zm7.41-8.59Q14,8.82 14,8T13.41,6.59T12,6T10.59,6.59Q10,7.18 10,8t0.59,1.41T12,10t1.41-0.59ZM12,8Zm0,10Z" /></svg>
                        <input type="text" id="login" placeholder="Логін" autoComplete="username" value={login} onChange={(event) => setLogin(event.target.value)}/>
                    </div>

                    <div className="form-group">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="24px" width="24px" fill="#1f1f1f"><path d="M6,22q-0.82,0-1.41-0.59T4,20V10Q4,9.17 4.59,8.59T6,8H7V6Q7,3.92 8.46,2.46T12,1t3.54,1.46T17,6V8h1q0.82,0 1.41,0.59T20,10V20q0,0.82-0.59,1.41T18,22H6Zm0-2H18V10H6V20Zm7.41-3.59Q14,15.83 14,15t-0.59-1.41T12,13t-1.41,0.59Q10,14.18 10,15t0.59,1.41T12,17t1.41-0.59ZM9,8h6V6q0-1.25-0.88-2.13T12,3T9.88,3.88T9,6V8ZM6,20V10V20Z" /></svg>
                        <input type="password" id="password" placeholder="Пароль" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)}/>
                    </div>

                    <button type="submit">
                        Увійти <span>→</span>
                    </button>

                    {error && (
                        <div className="login-error">
                            <span>!</span>
                            <p>Невірний логін або пароль</p>
                        </div>)}
                </form>
            </div>
        </div>
    );
}

export default Login;