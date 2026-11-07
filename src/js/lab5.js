import { usersFormat, filterUsersByParameters, validateUser } from "./lab2.js";

// TOP THEACHER
const teachersList = document.querySelector(".teachers-list")
const favoritesList = document.querySelector(".teachers-list-favorites");
const modal = document.querySelector("#teacher-ihor");
const pageNumbers = document.querySelector("#page-numbers");
const prevButton = document.querySelector("#prev-page");
const nextButton = document.querySelector("#next-page");

const webDataRocksContainer = document.querySelector("#webdatarocks-container");
const showCardsButton = document.querySelector("#show-teachers-cards");
const showCountryReportButton = document.querySelector("#show-country-report");
const showFlatTableButton = document.querySelector("#show-flat-table");

// TOP THEACHER MODAL
const mapContainer = document.querySelector("#teacher-map");
const toggleMap = document.querySelector(".toggle-map");
const closeButton = document.querySelector(".modal-close");

// TOP THACHER SHEARCH
const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector(".search-btn");

// TOP THEACHER FILTERS
const ageSelect = document.querySelector(".age-select");
const regionSelect = document.querySelector(".region-select");
const sexSelect = document.querySelector(".sex-select");
const favoriteSelect = document.querySelector(".favorite-select");

// STATISTICS
const genderChartCanvas = document.querySelector("#gender-chart");
const specialityChartCanvas = document.querySelector("#speciality-chart");
const ageChartCanvas = document.querySelector("#age-chart");
const nationalityChartCanvas = document.querySelector("#nationality-chart");
const sortHeaders = document.querySelectorAll("[data-sort]");

// ADD THEACHER
const addTeacherButton = document.querySelector(".add-button");
const teacherNameInput = document.querySelector(".teacher-name");
const teacherCourseInput = document.querySelector(".teacher-course");
const teacherCountryInput = document.querySelector(".teacher-country-input");
const teacherCityInput = document.querySelector(".teacher-city");
const teacherEmailInput = document.querySelector(".teacher-email");
const teacherPhoneInput = document.querySelector(".teacher-phone");
const teacherBirthInput = document.querySelector(".teacher-birth");
const teacherGenderInputs = document.querySelectorAll(".teacher-gender");
const teacherColorInput = document.querySelector(".teacher-color");
const teacherNoteInput = document.querySelector(".teacher-note");
const addTeacherModal = document.querySelector("#add-teacher");
const closeModalButton = addTeacherModal.querySelector(".modal-close");



// THEACHER AND MAP
let selectedTeacher = null;  // зберігаємо посилання поточного об'єкта викладача
let teacherMap = null;
let teacherMarker = null;

// TABLES AND DIAGRAMS
let webDataRocks = null;
let currentView = "cards";
let genderChart = null;
let specialityChart = null;
let ageChart = null;
let nationalityChart = null;

// SORTING
let currentSortField = "course";
let currentSortOrder = "ascending";

// INIT
const users = await getUsers();
let teachersFromAPI = [];
let currentTeachers = [];
let currentPage = 1;
const usersPerPage = 10;
let isLoading = false;

if (users !== null) {
    teachersFromAPI = usersFormat(users);
    currentTeachers = [...teachersFromAPI];
    renderCurrentPage();
    displayFavorites();
}



async function getUsers() {
    try {
        const response = await fetch('https://randomuser.me/api?results=50')
        if (!response.ok) {
            throw new Error('Помилка отримання даних');
        }
        const data = await response.json()
        return data.results
    }
    catch (error) {
        console.error('Помилка отримання даних:', error);
        return null
    }
}

async function getNextUsers() {
    try {
        const response = await fetch('https://randomuser.me/api?results=10');
        if (!response.ok) {
            throw new Error('Помилка отримання наступних користувачів');
        }
        const data = await response.json();
        return data.results;
    }
    catch (error) {
        console.error('Помилка отримання наступних користувачів:', error);
        return null;
    }
}

function renderCurrentPage() {
    const start = (currentPage - 1) * usersPerPage;
    const end = start + usersPerPage;
    const pageUsers = currentTeachers.slice(start, end);
    printTeacherList(pageUsers);
    printStatistics(currentTeachers);
    renderPageNumbers();
}

function renderPageNumbers() {
    const totalPages = Math.ceil(currentTeachers.length / usersPerPage);
    pageNumbers.innerHTML = "";
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    startPage = Math.max(1, endPage - 4);
    for (let page = startPage; page <= endPage; page++) {
        const button = document.createElement("button");
        button.textContent = page;
        if (page === currentPage) {
            button.classList.add("active");
        }
        button.addEventListener("click", () => {
            currentPage = page;
            renderCurrentPage();
        });
        pageNumbers.append(button);
    }
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = isLoading;
}

function getDaysUntilBirthday(b_date) {
    const today = dayjs().startOf("day");  // поточна дата та початок дня
    let nextBirthday = dayjs(b_date).year(today.year()).startOf("day"); // перетворення на об'єкт та беремо поточний рік
    if (nextBirthday.isBefore(today)) {
        nextBirthday = nextBirthday.add(1, "year"); // якщо дн минув переносимо на наступний рік
    }
    return nextBirthday.diff(today, "day");  //різниця між датами
}

prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;
        renderCurrentPage();
    }
});

nextButton.addEventListener("click", async () => {
    const totalPages = Math.ceil(currentTeachers.length / usersPerPage
    );
    if (currentPage < totalPages) {
        currentPage++;
        renderCurrentPage();
        return;
    }
    if (isLoading) {
        return;
    }
    isLoading = true;
    renderPageNumbers();
    const users = await getNextUsers();
    if (users !== null) {
        const newTeachers = usersFormat(users);
        teachersFromAPI.push(...newTeachers);
        currentTeachers.push(...newTeachers);
        currentPage++;
    }
    isLoading = false;
    renderCurrentPage();
});



function printTeacherList(teacherList) {
    teachersList.innerHTML = teacherList.map((teacher, index) => {
        return `
            <div class="teacher-card" data-index="${currentTeachers.indexOf(teacher)}">
                <div class="teacher-photo ${teacher.picture_large ? "" : "no-photo"}">
                ${teacher.picture_large
                ? `<img src="${teacher.picture_large}" alt="${teacher.full_name}">`
                : `<span>${teacher.full_name.split(" ").map(name => name[0]).join(".").toUpperCase()}</span>`}
                </div>
                <h3>${teacher.full_name}</h3>
                <p class="teacher-subject">${teacher.course}</p>
                <p class="teacher-country">${teacher.country}</p>
                <span class="favorite-star" data-action="favorite">
                ${teacher.favorite ? "★" : "☆"}
                </span>
            </div> `;
    }).join("");
}

teachersList.addEventListener("click", function (event) {
    const card = event.target.closest(".teacher-card");
    const photo = modal.querySelector(".modal-photo");

    if (!card) return;
    const index = Number(card.dataset.index);
    const teacher = currentTeachers[index];
    selectedTeacher = teacher;

    console.log("Викладач:", teacher.full_name);
    console.log("Місто:", teacher.city, teacher.country);
    console.log("Координати:", teacher.coordinates);

    // обробка зірочки
    if (event.target.closest(".favorite-star")) {
        teacher.favorite = !teacher.favorite;
        const star = card.querySelector(".favorite-star");
        star.textContent = teacher.favorite ? "★" : "☆";
        displayFavorites();
        return;
    }

    // фото викладача
    if (teacher.picture_large) {
        photo.innerHTML = `<img src="${teacher.picture_large}"alt="${teacher.full_name}">`;
    } else {
        const initials = teacher.full_name.split(" ").map(name => name[0]).join(".").toUpperCase();
        photo.innerHTML = `
            <div class="teacher-photo no-photo">
                <span>${initials}</span>
            </div>`;
    }

    // відображення інфо викладачів
    const info = modal.querySelector(".modal-info");
    info.innerHTML = `
        <div class="modal-name-row">
            <h3>${teacher.full_name}</h3>
            <span class="modal-star"> ${teacher.favorite ? "★" : "☆"}</span>
        </div>
        <h4>${teacher.course || "Course not write"}</h4>
        <p>${teacher.city}, ${teacher.country}</p>
        <p>${teacher.age ?? "—"}, ${teacher.gender}</p>
        <a href="mailto:${teacher.email}">${teacher.email || "Email not write"}</a>
        <p>${teacher.phone || "Phone not write"}</p>
        <p>Днів до дня народження: ${getDaysUntilBirthday(teacher.b_date)}</p>`;

    const description = modal.querySelector(".modal-description p");
    description.textContent = teacher.note || "No additional information.";

    // оновлення карти, якщо обрана інша картка
    if (teacherMap && !mapContainer.classList.contains("hidden")) {
        const latitude = Number(teacher.coordinates?.latitude);
        const longitude = Number(teacher.coordinates?.longitude);

        if (Number.isFinite(latitude) && Number.isFinite(longitude) &&  //скінченим числом
            latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
        ) {
            teacherMap.setView([latitude, longitude], 10);
            teacherMarker.setLatLng([latitude, longitude]);  //переміщення маркер
            teacherMap.invalidateSize();  //перерахувати розмір карти
        }
    }

    modal.classList.remove("closed");
    window.location.hash = "teacher-ihor";
});

// зірочка в попап вікні і пошук всіх зірочок конкретного викладача
modal.addEventListener("click", function (event) {
    const modalStar = event.target.closest(".modal-star");
    if (!modalStar) return;
    if (!selectedTeacher) return;
    selectedTeacher.favorite = !selectedTeacher.favorite;
    modalStar.textContent = selectedTeacher.favorite ? "★" : "☆";
    const index = currentTeachers.indexOf(selectedTeacher);
    const card = teachersList.querySelector(`.teacher-card[data-index="${index}"]`);
    if (card) {
        const cardStar = card.querySelector(".favorite-star");
        if (cardStar) {
            cardStar.textContent = selectedTeacher.favorite ? "★" : "☆";
        }
    }
    displayFavorites();
});

toggleMap.addEventListener("click", function (event) {
    event.preventDefault();
    if (!selectedTeacher) return;
    const isHidden = mapContainer.classList.contains("hidden");

    if (isHidden) {
        const latitude = Number(selectedTeacher.coordinates?.latitude);
        const longitude = Number(selectedTeacher.coordinates?.longitude);

        // перевірка чи правильні координати
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
            latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180
        ) {
            mapContainer.classList.remove("hidden");
            mapContainer.textContent = "Coordinates are unavailable.";
            return;
        }
        mapContainer.classList.remove("hidden");

        if (!teacherMap) { // створення карти
            teacherMap = L.map(mapContainer).setView([latitude, longitude], 10); // створюємо карту

            // катографічне зображення
            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(teacherMap); //додаємо шар до наої карти

            teacherMarker = L.marker([latitude, longitude]).addTo(teacherMap);  //маркер викладача
        } else {
            teacherMap.setView([latitude, longitude], 10);
            teacherMarker.setLatLng([latitude, longitude]);
        }

        setTimeout(() => { teacherMap.invalidateSize(); }, 100);  // оновлення карти розміри
    } else {
        mapContainer.classList.add("hidden");
    }
});

// закриваємо попап вікно
closeButton.addEventListener("click", function () {
    modal.classList.add("closed");
    history.replaceState(null, "", window.location.pathname + window.location.search);
});



function prepareTeachersForReport(teachers) {  // формат для звіту
    return teachers.map(teacher => ({
        "Full Name": teacher.full_name || "",
        "Course": teacher.course || "",
        "Country": teacher.country || "",
        "City": teacher.city || "",
        "Gender": teacher.gender || "",
        "Age": teacher.age ?? "",
        "Email": teacher.email || "",
        "Phone": teacher.phone || "",
        "Birthday": teacher.b_date || "",
        "Favorite": teacher.favorite ? "Yes" : "No"
    }));
}

function showTeachersView(view) {
    currentView = view;
    const showCards = view === "cards";
    // Відображення карток, звіту, фільтрів і пагінації залежно від вибраного режиму
    // Якщо вибрано режим карток, показуємо картки, фільтри та пагінацію.
    // Якщо вибрано звіт або плоску таблицю, показуємо WebDataRocks, а картки, фільтри та пагінацію приховуємо.
    teachersList.style.display = showCards ? "grid" : "none";
    webDataRocksContainer.style.display = showCards ? "none" : "block";
    document.querySelector(".teachers-filters").style.display = showCards ? "flex" : "none";
    const pagination = document.querySelector(".pagination");

    if (pagination) {
        pagination.style.display = showCards ? "flex" : "none";
    }

    // активна кнопка
    showCardsButton.classList.toggle("active", showCards);
    showCountryReportButton.classList.toggle("active", view === "countries");
    showFlatTableButton.classList.toggle("active", view === "flat");

    if (showCards) {  // якщо режим карток
        return;
    }

    // звіт або таблиця
    const reportData = prepareTeachersForReport(teachersFromAPI);
    let report;

    if (view === "flat") {
        report = {
            dataSource: {
                data: reportData  // звідки йдуть дані
            },
            slice: {
                flatOrder: ["Full Name", "Course", "Country", "City", "Gender", "Age", "Email", "Phone", "Birthday","Favorite"]
            },
            options: { grid: { type: "flat"} // режим таблиці 
            }
        };
    } else {
        report = {
            dataSource: {
                data: reportData
            },
            slice: {
                rows: [
                    { uniqueName: "Country" }  // визначаємо за яким полем групувати
                ],
                measures: [   // що обчислюємо 
                    {
                        uniqueName: "Country",    // для країни 
                        aggregation: "count",     // кількість 
                        caption: "Teachers"       // назва
                    }
                ]
            }
        };
    }

    // створення екземпляру бібліотеки
    if (!webDataRocks) {
        webDataRocks = new WebDataRocks({
            container: "#webdatarocks-container",  // де відображається таблиця html
            toolbar: true,
            report: report
        });
    } else {
        webDataRocks.setReport(report);  // оновлення
    }
}

showCardsButton.addEventListener("click", () => {
    showTeachersView("cards");
});

showCountryReportButton.addEventListener("click", () => {
    showTeachersView("countries");
});

showFlatTableButton.addEventListener("click", () => {
    showTeachersView("flat");
});



function printStatistics(userList) {
    const genderCounts = {};
    const specialityCounts = {};
    const ageCounts = {};
    const nationalityCounts = {};

    userList.forEach(user => {
        genderCounts[user.gender] = (genderCounts[user.gender] || 0) + 1;
        specialityCounts[user.course] = (specialityCounts[user.course] || 0) + 1;
        let ageGroup;

        if (user.age < 30) {
            ageGroup = "Under 30";
        } else if (user.age < 40) {
            ageGroup = "30–39";
        } else if (user.age < 50) {
            ageGroup = "40–49";
        } else if (user.age < 60) {
            ageGroup = "50–59";
        } else {
            ageGroup = "60+";
        }

        ageCounts[ageGroup] = (ageCounts[ageGroup] || 0) + 1;
        nationalityCounts[user.country] = (nationalityCounts[user.country] || 0) + 1;
    });

    function updateChart(chart, canvas, labels, counts) {
        const chartData = {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: ["#5bc0de", "#ff9990", "#a8d5a2", "#c3a6e8", "#f7d794", "#778beb", "#f3a683", "#786fa6"]
            }]
        };

        //оновлення даних
        if (chart) {
            chart.data = chartData;
            chart.update();
            return chart;
        }

        return new Chart(canvas, {
            type: "pie",
            data: chartData,
            options: {
                responsive: true,  //адаптив
                maintainAspectRatio: false, //зміна висоти й ширини незалежно від стандартного співвідношення сторін
                plugins: {
                    legend: { position: "bottom" } // перелік категорій внизу
                }
            }
        });
    }

    genderChart = updateChart(
        genderChart,
        genderChartCanvas,
        Object.keys(genderCounts), // ключ
        Object.values(genderCounts) // значення
    );

    specialityChart = updateChart(
        specialityChart,
        specialityChartCanvas,
        Object.keys(specialityCounts),
        Object.values(specialityCounts)
    );

    ageChart = updateChart(
        ageChart,
        ageChartCanvas,
        Object.keys(ageCounts),
        Object.values(ageCounts)
    );

    nationalityChart = updateChart(
        nationalityChart,
        nationalityChartCanvas,
        Object.keys(nationalityCounts),
        Object.values(nationalityCounts)
    );
}

function displayFavorites() {
    const favoriteTeachers = teachersFromAPI.filter(teacher => teacher.favorite);
    favoritesList.innerHTML = favoriteTeachers.map(teacher => {
        const initials = teacher.full_name.split(" ").map(name => name[0]).join(".").toUpperCase();
        return `
            <div class="teacher-card">
                <div class="teacher-photo ${teacher.picture_large ? "" : "no-photo"}">
                    ${teacher.picture_large ? `<img src="${teacher.picture_large}" alt="${teacher.full_name}">` : `<span>${initials}</span>`}
                </div>
                <h3>${teacher.full_name}</h3>
                <p class="teacher-subject">${teacher.course || ""}</p>
                <p class="teacher-country">${teacher.country || ""}</p>
            </div>`;
    }).join("");
}

function updateTeacherList() {
    const filters = {};

    if (regionSelect.value !== "All") {
        filters.country = regionSelect.value;
    }

    if (sexSelect.value !== "All") {
        filters.gender = sexSelect.value;
    }

    if (favoriteSelect.checked) {
        filters.favorite = true;
    }

    let filteredUsers = filterUsersByParameters(teachersFromAPI, filters);

    if (ageSelect.value === "under25") {
        filteredUsers = _.filter(filteredUsers, teacher => teacher.age <= 25);
    }

    if (ageSelect.value === "26-35") {
        filteredUsers = _.filter(filteredUsers, teacher => teacher.age >= 26 && teacher.age <= 35);
    }

    if (ageSelect.value === "36-45") {
        filteredUsers = _.filter(filteredUsers, teacher => teacher.age >= 36 && teacher.age <= 45);
    }

    if (ageSelect.value === "46-60") {
        filteredUsers = _.filter(filteredUsers, teacher => teacher.age >= 46 && teacher.age <= 60);
    }

    if (ageSelect.value === "over60") {
        filteredUsers = _.filter(filteredUsers, teacher => teacher.age > 60);
    }

    if (ageSelect.value === "ascending") {
        filteredUsers = _.orderBy(filteredUsers, ["age"], ["asc"]);
    }

    if (ageSelect.value === "descending") {
        filteredUsers = _.orderBy(filteredUsers, ["age"], ["desc"]);
    }

    currentTeachers = filteredUsers;
    currentPage = 1;
    renderCurrentPage();
}
regionSelect.addEventListener("change", updateTeacherList);
sexSelect.addEventListener("change", updateTeacherList);
ageSelect.addEventListener("change", updateTeacherList);
favoriteSelect.addEventListener("change", updateTeacherList);


sortHeaders.forEach(header => {
    header.addEventListener("click", function () {
        const field = header.dataset.sort;

        if (currentSortField === field) {
            currentSortOrder = currentSortOrder === "ascending" ? "descending" : "ascending";
        } else {
            currentSortField = field;
            currentSortOrder = "ascending";
        }

        const sortedUsers = _.orderBy(
            currentTeachers,
            [
                teacher => {
                    if (field === "age") {
                        return teacher.age ?? Infinity;
                    }

                    return _.toLower(_.get(teacher, field, ""));
                }
            ],
            [currentSortOrder]
        );
        currentTeachers = sortedUsers;
        currentPage = 1;
        renderCurrentPage();
    });
});

function searchTeachers() {
    const searchValue = _.toLower(searchInput.value.trim());
    const filteredUsers = _.filter(teachersFromAPI, user => {
        return (
            _.includes(_.toLower(user.full_name || ""), searchValue) ||
            _.includes(_.toLower(user.note || ""), searchValue) ||
            _.includes(String(user.age ?? ""), searchValue)
        );
    });
    currentTeachers = filteredUsers;
    currentPage = 1;
    renderCurrentPage();
}
searchButton.addEventListener("click", searchTeachers);



closeModalButton.addEventListener("click", () => {
    window.location.hash = "";
});

addTeacherButton.addEventListener("click", async function () {

    // Отримуємо дані користувача з форми
    const fullName = teacherNameInput.value.trim();
    const course = teacherCourseInput.value;
    const country = teacherCountryInput.value;
    const city = teacherCityInput.value.trim();
    const email = teacherEmailInput.value.trim();
    const phone = teacherPhoneInput.value.trim();
    const birthValue = teacherBirthInput.value;
    const note = teacherNoteInput.value.trim();

    if (!fullName || !course || !country || !city ||
        !email || !phone || !birthValue) {
        alert("Please fill in all fields.");
        return;
    }

    let gender = "";

    teacherGenderInputs.forEach(input => {
        if (input.checked) {
            gender = input.value;
        }
    });

    if (!gender) {
        alert("Please choose gender.");
        return;
    }

    gender = gender.charAt(0).toUpperCase() + gender.slice(1);

    const birthDate = new Date(birthValue);
    const today = new Date();

    if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
        alert("Please enter a valid date of birth.");
        return;
    }

    let age = today.getFullYear() - birthDate.getFullYear();

    if (
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate())
    ) {
        age--;
    }

    const teacher = {
        full_name: fullName,
        course: course,
        country: country,
        city: city,
        email: email,
        phone: phone,
        b_date: birthValue,
        age: age,
        gender: gender,
        state: "",
        note: note,
        bg_color: teacherColorInput.value,
        favorite: false,
        picture_large: ""
    };

    // Перевіряємо дані перед відправленням
    if (!validateUser(teacher)) {
        alert(
            "Invalid data. Check the first letters of the fields " +
            "and the phone number format for the selected country."
        );
        return;
    }

    // Відправляємо провалідовані дані на json-server
    let savedTeacher;

    try {
        const response = await fetch("http://localhost:3001/teachers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(teacher)
        });

        if (!response.ok) {
            throw new Error("Failed to save teacher");
        }

        savedTeacher = await response.json();

    } catch (error) {
        console.error("Error saving teacher:", error);
        alert("Could not save teacher to the server. Please try again.");
        return;
    }

    // Додаємо збереженого викладача до списку
    teachersFromAPI.unshift(savedTeacher);
    currentTeachers.unshift(savedTeacher);
    currentPage = 1;
    // currentStatisticsPage = 1;
    renderCurrentPage();

    // Очищаємо форму
    teacherNameInput.value = "";
    teacherCourseInput.selectedIndex = 0;
    teacherCountryInput.selectedIndex = 0;
    teacherCityInput.value = "";
    teacherEmailInput.value = "";
    teacherPhoneInput.value = "";
    teacherBirthInput.value = "";

    teacherGenderInputs.forEach(input => {
        input.checked = false;
    });

    teacherColorInput.value = "#000000";
    teacherNoteInput.value = "";

    window.location.hash = "";
});
