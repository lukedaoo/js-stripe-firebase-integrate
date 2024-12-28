import { isLoggedIn } from "./firebase-functions.js";


isLoggedIn()
    .then(isAuthenticated => {
        if (isAuthenticated) {
            console.log("Free content is available for this user");
        } else {
            console.log("Need to log in to see it");
            window.location.href = "../html/404.html";
        }
    })
    .catch(err => {
        console.log(err.message)
        window.location.href = "../html/404.html";
    });
