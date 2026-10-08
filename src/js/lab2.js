import { randomUserMock, additionalUsers } from "./FE4U-Lab2-mock.js";

// ЗАВДАННЯ 1 

const list_of_courses = ["Mathematics", "Physics", "English", "Computer Science", "Dancing", "Chess", 
"Biology", "Chemistry", "Law", "Art", "Medicine", "Statistics"]

function getRandomCourse(){
    const index = Math.floor(Math.random() * list_of_courses.length);
    return list_of_courses[index]
}

function usersFormat(userList){
    return userList.map(user =>{
        return{
            gender: user.gender,
            title: user.name.title,
            full_name: user.name.first + " " + user.name.last,
            city: user.location.city,
            state: user.location.state,
            country: user.location.country,
            postcode: user.location.postcode,
            coordinates: {
                latitude: user.location.coordinates.latitude,
                longitude: user.location.coordinates.longitude
            },
            timezone: {
                offset: user.location.timezone.offset,
                description: user.location.timezone.description
            },
            email: user.email,
            b_date: user.dob.date,
            age: user.dob.age,
            phone: user.phone,
            picture_large: user.picture.large,
            picture_thumbnail: user.picture.thumbnail,
            id: user.id.value === null? "": user.id.name + user.id.value,
            favorite: false,
            course: getRandomCourse(),
            bg_color: "#ffffff",
            note: ""
        };
    });
}

function joinUsers(userList1, userList2){
    const allUserList = [...userList1, ...userList2]
    const uniqueUsers = [];
    for(let i = 0; i < allUserList.length; i++){
        const user = uniqueUsers.find(item => item.full_name === allUserList[i].full_name)
        if (!user) {
            uniqueUsers.push(allUserList[i]);
        }
    }
    return uniqueUsers
}
const formattedUsers = usersFormat(randomUserMock);
const allUsers = joinUsers(formattedUsers, additionalUsers)
// console.log(allUsers.length);

// ЗАВДАННЯ 2

function validateUser(user) {

    function validString(value){
        return typeof value === "string" && /^[A-ZА-ЯІЇЄҐ]/.test(value);
    };

    function validPhone(phone, country){

        if (typeof phone !== "string") {
            return false;
        }

        if (country === "France") {
            return /^\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/.test(phone);   //05-70-80-69-86
        }

        if (country === "Norway" || country === "Denmark") {
            return /^\d{8}$/.test(phone);   //36513745
        }

        if (country === "United States" || country === "Netherlands" || country === "Turkey" || country === "New Zealand") {
            return /^\(\d{3}\)-\d{3}-\d{4}$/.test(phone);   //(720)-981-1014
        }

        if (country === "Canada" || country === "Ireland") {
            return /^\d{3}-\d{3}-\d{4}$/.test(phone);   //636-857-3801
        }

        if (country === "Spain") {
            return /^\d{3}-\d{3}-\d{3}$/.test(phone);   //921-757-670
        }

        if (country === "Germany") {
            return /^\d{4}-\d{7}$/.test(phone);   //0079-8291509
        }

        if (country === "Iran") {
            return /^\d{3}-\d{8}$/.test(phone);   //008-22619690
        }

        if (country === "Switzerland") {
            return /^\d{3} \d{3} \d{2} \d{2}$/.test(phone);   //077 863 38 70
        }

        if (country === "Australia") {
            return /^\d{2}-\d{4}-\d{4}$/.test(phone);   //02-6397-0344
        }

        if (country === "Finland") {
            return /^\d{2}-\d{3}-\d{3}$/.test(phone);   //04-531-159
        }
        return false;
    };

    return (
        validString(user.full_name) &&
        validString(user.gender) &&
        validString(user.note) &&
        validString(user.state) &&
        validString(user.city) &&
        validString(user.country) &&
        typeof user.age === "number" &&
        validPhone(user.phone, user.country) &&
        typeof user.email === "string" && user.email.includes("@")
    );
}
// console.log(validateUser(allUsers[0]));

// ЗАВДАННЯ 3

function filterUsersByParameters(userList, filters){
    return userList.filter(user => {
        if (filters.country !== undefined && user.country !== filters.country) {
            return false;
        }

        if (filters.age !== undefined && user.age !== filters.age) {
            return false;
        }

        if (filters.gender !== undefined && user.gender !== filters.gender) {
            return false;
        }

        if (filters.favorite !== undefined && user.favorite !== filters.favorite) {
            return false;
        }

        return true;
    });
}

// const filteredUsers = filterUsersByParameters(allUsers, {
//     country: "Denmark",
//     gender: "male",
//     favorite: false
// });
// console.log(filteredUsers);


// ЗАВДАННЯ 4

function sortUsersByParameters(userList, parameter, order = "asc") {
    return [...userList]
        .filter(user => user[parameter] !== undefined)
        .sort((a, b) => {

            if (a[parameter] < b[parameter]) {
                if (order === "asc") {
                    return -1;
                } else {
                    return 1;
                }
            }

            if (a[parameter] > b[parameter]) {
                if (order === "asc") {
                    return 1;
                } else {
                    return -1;
                }
            }

            return 0;
        });
}


// const sortedUsers = sortUsersByParameters(allUsers, "age", "asc");
// const sortedUsers = sortUsersByParameters(allUsers, "age", "desc");
// const sortedUsers = sortUsersByParameters(allUsers, "country", "desc");
// const sortedUsers = sortUsersByParameters(allUsers, "full_name", "asc");
// console.log(sortedUsers);

// ЗАВДАННЯ 5

function findUsersByParameters(userList, parameter, value) {
    return userList.find(user => user[parameter] === value);
}

// const user = findUsersByParameters(allUsers, "age", 34);
// const user = findUsersByParameters(allUsers, "full_name", "Norbert Weishaupt");
// const user = findUsersByParameters(allUsers, "note", "Good student");
// console.log(user);


// ЗАВДАННЯ 6

function getUsersByPercentage(userList, condition) {
    const foundUsers = userList.filter(condition);
    return Math.round((foundUsers.length / userList.length) * 100);
}

// const percentage = getUsersByPercentage(allUsers, user => user.age > 30);
// const percentage = getUsersByPercentage(allUsers, user => user.favorite === true);
// const percentage = getUsersByPercentage(allUsers, user => user.country === "Germany");
// console.log(percentage);