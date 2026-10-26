import { allUsers, filterUsersByParameters, validateUser } from "./lab2.js";

// ЗАВДАННЯ 1
const teachersList = document.querySelector(".teachers-list")
const statisticsBody = document.querySelector(".statistics-body");
const favoritesList = document.querySelector(".teachers-list-favorites");
const modal = document.querySelector("#teacher-ihor");

function printTeacherList(teacherList) {
    teachersList.innerHTML = teacherList.map((teacher) => {
        return `
            <div class="teacher-card" data-index="${allUsers.indexOf(teacher)}">
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
    statisticsBody.innerHTML = userList.map(user => {
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
}

function displayFavorites() {
    const favoriteTeachers = allUsers.filter(teacher => teacher.favorite);
    favoritesList.innerHTML = favoriteTeachers.map(teacher => {
        const initials = teacher.full_name.split(" ").map(name => name[0]) .join(".").toUpperCase();
        return `
            <div class="teacher-card">
                <div class="teacher-photo ${teacher.picture_large ? "" : "no-photo"}">
                    ${teacher.picture_large ? `<img src="${teacher.picture_large}" alt="${teacher.full_name}">`: `<span>${initials}</span>`}
                </div>
                <h3>${teacher.full_name}</h3>
                <p class="teacher-subject">${teacher.course || ""}</p>
                <p class="teacher-country">${teacher.country || ""}</p>
            </div>`;
    }).join("");
}

printTeacherList(allUsers)
printStatistics(allUsers);
displayFavorites();

let selectedTeacher = null;  // зберігаємо посилання поточного об'єкта викладача
 
teachersList.addEventListener("click", function (event) {
    const card = event.target.closest(".teacher-card");
    const photo = modal.querySelector(".modal-photo");

    if (!card) return;
    const index = Number(card.dataset.index);
    const teacher = allUsers[index];
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
        photo.innerHTML = `
            <img src="${teacher.picture_large}"
                 alt="${teacher.full_name}">`;
    } else {
        const initials = teacher.full_name.split(" ") .map(name => name[0]).join(".").toUpperCase();
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
    const index = allUsers.indexOf(selectedTeacher);
    const card = teachersList.querySelector(`.teacher-card[data-index="${index}"]` );
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
    history.replaceState(null,"",window.location.pathname + window.location.search);
});



// ЗАВДАННЯ 2
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

    if (
        ageSelect.value !== "All" &&
        ageSelect.value !== "ascending" &&
        ageSelect.value !== "descending"
    ) {
        filters.age = Number(ageSelect.value);
    }

    const filteredUsers = filterUsersByParameters(allUsers, filters);

    if (ageSelect.value === "ascending") {
        filteredUsers.sort((a, b) => a.age - b.age);
    }

    if (ageSelect.value === "descending") {
        filteredUsers.sort((a, b) => b.age - a.age);
    }

    printTeacherList(filteredUsers);
}

regionSelect.addEventListener("change", updateTeacherList);
sexSelect.addEventListener("change", updateTeacherList);
ageSelect.addEventListener("change", updateTeacherList);
favoriteSelect.addEventListener("change", updateTeacherList);



// ЗАВДАННЯ 3
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

        const sortedUsers = [...allUsers].sort((a, b) => {
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
        printStatistics(sortedUsers);
    });
});

// ЗАВДАННЯ 4
const searchInput = document.querySelector(".search input");
const searchButton = document.querySelector(".search-btn");

function searchTeachers() {
    const searchValue = searchInput.value.trim().toLowerCase();

    const filteredUsers = allUsers.filter(user => {
        return (
            (user.full_name || "").toLowerCase().includes(searchValue) ||
            (user.note || "").toLowerCase().includes(searchValue) ||
            String(user.age ?? "").includes(searchValue)
        );
    });
    printTeacherList(filteredUsers);
}
searchButton.addEventListener("click", searchTeachers);



// ЗАВДАННЯ 5
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

addTeacherButton.addEventListener("click", function () {

    // дині користувач
    const fullName = teacherNameInput.value.trim();
    const course = teacherCourseInput.value;
    const country = teacherCountryInput.value;
    const city = teacherCityInput.value.trim();
    const email = teacherEmailInput.value.trim();
    const phone = teacherPhoneInput.value.trim();
    const birthValue = teacherBirthInput.value;
    const note = teacherNoteInput.value.trim();

    if (!fullName || !course || !country || !city ||!email || !phone || !birthValue) {
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
    if (today.getMonth() < birthDate.getMonth() ||(today.getMonth() === birthDate.getMonth() &&today.getDate() < birthDate.getDate())) {
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

    if (!validateUser(teacher)) {
        alert("Invalid data. Check the first letters of the fields " +
            "and the phone number format for the selected country.");
        return;
    }
    allUsers.push(teacher);
    printTeacherList(allUsers);
    printStatistics(allUsers);
    displayFavorites();

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

    document.querySelector("#add-teacher .modal-close").click();
});
