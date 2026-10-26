import { usersFormat, filterUsersByParameters, validateUser } from "./lab2.js";

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

function renderStatisticsPagination(totalUsers) {
    const totalPages = Math.ceil(totalUsers / statisticsPerPage);
    statisticsPagination.innerHTML = "";
    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement("button");
        button.textContent = page;
        button.type = "button";
        if (page === currentStatisticsPage) {
            button.classList.add("active");
        }
        button.addEventListener("click", () => {
            currentStatisticsPage = page;
            printStatistics(currentTeachers);
        });
        statisticsPagination.append(button);
    }
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

const teachersList = document.querySelector(".teachers-list")
const statisticsBody = document.querySelector(".statistics-body");
const favoritesList = document.querySelector(".teachers-list-favorites");
const modal = document.querySelector("#teacher-ihor");
const pageNumbers = document.querySelector("#page-numbers");
const prevButton = document.querySelector("#prev-page");
const nextButton = document.querySelector("#next-page");
const statisticsPagination = document.querySelector(".statistics-pagination");

const statisticsPerPage = 25;
let currentStatisticsPage = 1;

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

function printStatistics(userList) {
    const start = (currentStatisticsPage - 1) * statisticsPerPage;
    const end = start + statisticsPerPage;
    const pageUsers = userList.slice(start, end);
    statisticsBody.innerHTML = pageUsers.map(user => {
        return `
            <tr>
                <td>${user.full_name}</td>
                <td>${user.course}</td>
                <td>${user.age}</td>
                <td>${user.gender}</td>
                <td>${user.country}</td>
            </tr>
        `;
    }).join("");
    renderStatisticsPagination(userList.length);
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


let selectedTeacher = null;  // зберігаємо посилання поточного об'єкта викладача
teachersList.addEventListener("click", function (event) {
    const card = event.target.closest(".teacher-card");
    const photo = modal.querySelector(".modal-photo");

    if (!card) return;
    const index = Number(card.dataset.index);
    const teacher = currentTeachers[index];
    selectedTeacher = teacher;

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
        <p>${teacher.phone || "Phone not write"}</p>`;

    const description = modal.querySelector(".modal-description p");
    description.textContent = teacher.note || "No additional information.";

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

// закриваємо попап вікно
const closeButton = document.querySelector(".modal-close");
closeButton.addEventListener("click", function () {
    modal.classList.add("closed");
    history.replaceState(null, "", window.location.pathname + window.location.search);
});

const ageSelect = document.querySelector(".age-select");
const regionSelect = document.querySelector(".region-select");
const sexSelect = document.querySelector(".sex-select");
const favoriteSelect = document.querySelector(".favorite-select");

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
        filteredUsers = filteredUsers.filter(teacher => teacher.age <= 25);
    }

    if (ageSelect.value === "26-35") {
        filteredUsers = filteredUsers.filter(teacher => teacher.age >= 26 && teacher.age <= 35);
    }

    if (ageSelect.value === "36-45") {
        filteredUsers = filteredUsers.filter(teacher => teacher.age >= 36 && teacher.age <= 45);
    }

    if (ageSelect.value === "46-60") {
        filteredUsers = filteredUsers.filter(teacher => teacher.age >= 46 && teacher.age <= 60);
    }

    if (ageSelect.value === "over60") {
        filteredUsers = filteredUsers.filter(teacher => teacher.age > 60);
    }

    if (ageSelect.value === "ascending") {
        filteredUsers.sort((a, b) => a.age - b.age);
    }

    if (ageSelect.value === "descending") {
        filteredUsers.sort((a, b) => b.age - a.age);
    }
    currentTeachers = filteredUsers;
    currentPage = 1;
    currentStatisticsPage = 1;
    renderCurrentPage();
}
regionSelect.addEventListener("change", updateTeacherList);
sexSelect.addEventListener("change", updateTeacherList);
ageSelect.addEventListener("change", updateTeacherList);
favoriteSelect.addEventListener("change", updateTeacherList);

let currentSortField = "course";
let currentSortOrder = "ascending";
const sortHeaders = document.querySelectorAll("[data-sort]");
sortHeaders.forEach(header => {
    header.addEventListener("click", function () {
        const field = header.dataset.sort;

        if (currentSortField === field) {
            currentSortOrder = currentSortOrder === "ascending" ? "descending" : "ascending";
        } else {
            currentSortField = field;
            currentSortOrder = "ascending";
        }

        const sortedUsers = [...currentTeachers].sort((a, b) => {
            let result;

            if (field === "age") {
                const ageA = a.age ?? (a.b_date ? new Date().getFullYear() - new Date(a.b_date).getFullYear() : null);
                const ageB = b.age ?? (b.b_date ? new Date().getFullYear() - new Date(b.b_date).getFullYear() : null);

                // якщо не визначений вік, то в кінці списку
                if (ageA === null) return 1;
                if (ageB === null) return -1;

                result = ageA - ageB;
            } else {
                result = String(a[field] ?? "").localeCompare(String(b[field] ?? ""));
            }

            return currentSortOrder === "ascending" ? result : -result;
        });
        currentTeachers = sortedUsers;
        currentPage = 1;
        currentStatisticsPage = 1;
        renderCurrentPage();
    });
});

const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector(".search-btn");
function searchTeachers() {
    const searchValue = searchInput.value.trim().toLowerCase();

    const filteredUsers = teachersFromAPI.filter(user => {
        return (
            (user.full_name || "").toLowerCase().includes(searchValue) ||
            (user.note || "").toLowerCase().includes(searchValue) ||
            String(user.age ?? "").includes(searchValue)
        );
    });
    currentTeachers = filteredUsers;
    currentPage = 1;
    currentStatisticsPage = 1;
    renderCurrentPage();
}
searchButton.addEventListener("click", searchTeachers);

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
    currentStatisticsPage = 1;
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