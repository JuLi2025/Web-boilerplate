function WeatherCard({ day, icon, maxTemp, minTemp }) {
    return (
        <div className="weather-card">
            <h3>{day}</h3>
            <div className="weather-icon">
                {icon}
            </div>
            <p className="max-temp">{maxTemp}°C</p>
            <p className="min-temp">{minTemp}°C</p>
        </div>
    );
}

export default WeatherCard;