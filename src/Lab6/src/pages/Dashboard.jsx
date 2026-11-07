import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo.png';
import WeatherCard from '../components/WeatherCard';
import Loader from '../components/Loader';
import '../styles/Dashboard.css';

function getWeatherInfo(code) {
    if (code === 0) {
        return { icon: '☀️', description: 'Ясно' };
    }

    if ([1, 2].includes(code)) {
        return { icon: '🌤️', description: 'Мінлива хмарність' };
    }

    if (code === 3) {
        return { icon: '☁️', description: 'Хмарно' };
    }

    if ([45, 48].includes(code)) {
        return { icon: '🌫️', description: 'Туман' };
    }

    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
        return { icon: '🌧️', description: 'Дощ' };
    }

    if ([71, 73, 75, 77, 85, 86].includes(code)) {
        return { icon: '❄️', description: 'Сніг' };
    }

    if ([95, 96, 99].includes(code)) {
        return { icon: '⛈️', description: 'Гроза' };
    }

    return { icon: '🌤️', description: 'Змінна погода' };
}

function Dashboard() {
    // збереження даних про погоду, завантаження даних та назва місце знаходження
    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [locationName, setLocationName] = useState('');

    useEffect(() => {
        async function fetchWeather() {
            const timer = new Promise(resolve => setTimeout(resolve, 5000));

            try {
                setIsLoading(true);
                setError('');
                // отримання координат місцезнаходження
                const position = await new Promise((success, fail) => {
                    navigator.geolocation.getCurrentPosition(success, fail,
                        {
                            timeout: 10000,              // скільки чекати
                            enableHighAccuracy: false   // на скільки точне місцерозташування
                        }
                    );
                });

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                console.log(latitude)
                console.log(longitude)

                setLocationName('Моє місцезнаходження');

                // параметр запиту для прогнозу погоди
                const params = new URLSearchParams({
                    latitude,
                    longitude,
                    current: 'temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,surface_pressure',
                    daily: 'weather_code,temperature_2m_max,temperature_2m_min',
                    wind_speed_unit: 'ms',
                    timezone: 'auto',
                    forecast_days: 5
                });

                // Отримуємо погоду
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
                if (!response.ok) {throw new Error('Не вдалося отримати дані про погоду');}
                const data = await response.json();
                setWeather(data);

            } catch (err) {
                console.log(err);
                setError('Не вдалося визначити місцезнаходження або завантажити погоду.');

            } finally {
                await timer;
                setIsLoading(false);
            }
        }
        fetchWeather();
    }, []);

    function handleLogout() {
        document.cookie = "isAuthenticated=; path=/; max-age=0";
        navigate('/');
    }

    if (isLoading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="dashboard-message">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>
                    Спробувати ще раз
                </button>
            </div>
        );
    }

    // перетворюємо дані прогнозу на масив для карток
    const forecast = weather.daily.time.map((date, index) => {  // дати
        const weatherInfo = getWeatherInfo(weather.daily.weather_code[index]);   //код погоди саме той який обробляє map
        const formattedDate = new Date(`${date}T12:00:00`);   // створюємо дату опівдні
        return {
            id: date,
            day: formattedDate.toLocaleDateString('uk-UA', {   // перетворення дати 
                weekday: 'short',
                day: 'numeric',
                month: 'numeric'
            }),
            icon: weatherInfo.icon,
            maxTemp: Math.round(weather.daily.temperature_2m_max[index]),
            minTemp: Math.round(weather.daily.temperature_2m_min[index])
        };
    });

    const current = weather.current;
    const currentWeatherInfo = getWeatherInfo(current.weather_code);

    return (
        <div className="dashboard-page">
            <div className="dashboard-container">

                <header className="dashboard-header">
                    <div className="dashboard-logo">
                        <img src={logo} alt="Weatherly logo" />
                        <h1>Weatherly</h1>
                    </div>

                    <button className="logout-button" onClick={handleLogout}>
                        <span>⇥</span>
                        Вийти
                    </button>
                </header>

                <main className="dashboard-content">

                    <section className="current-weather">

                        <div className="current-main">
                            <h2>📍 {locationName}</h2>

                            <div className="current-temperature">
                                {Math.round(current.temperature_2m)}°C
                            </div>

                            <p className="weather-description">
                                {currentWeatherInfo.description}
                            </p>
                        </div>

                        <div className="current-icon">
                            {currentWeatherInfo.icon}
                        </div>

                        <div className="weather-details">

                            <div className="weather-detail">
                                <span>≋</span>
                                <div>
                                    <p>Вітер</p>
                                    <strong>{current.wind_speed_10m} м/с</strong>
                                </div>
                            </div>

                            <div className="weather-detail">
                                <span>💧</span>
                                <div>
                                    <p>Вологість</p>
                                    <strong>{current.relative_humidity_2m}%</strong>
                                </div>
                            </div>

                            <div className="weather-detail">
                                <span>◉</span>
                                <div>
                                    <p>Тиск</p>
                                    <strong>{Math.round(current.surface_pressure)} гПа</strong>
                                </div>
                            </div>

                        </div>
                    </section>

                    <section className="forecast-section">
                        <h2>Прогноз на 5 днів</h2>

                        <div className="forecast-list">
                            {forecast.map((item) => (
                                <WeatherCard
                                    key={item.id}
                                    day={item.day}
                                    icon={item.icon}
                                    maxTemp={item.maxTemp}
                                    minTemp={item.minTemp}
                                />
                            ))}
                        </div>
                    </section>

                    <p className="weather-credit">
                        Дані про погоду: Open-Meteo
                    </p>

                </main>
            </div>
        </div>
    );
}

export default Dashboard;