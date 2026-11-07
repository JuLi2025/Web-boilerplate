import '../styles/Loader.css';
function Loader() {
    return (
        <div className="loader-container">
            <div className="loader"></div>
            <p>Завантажуємо прогноз погоди...</p>
        </div>
    );
}

export default Loader;