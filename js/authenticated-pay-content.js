import { isLoggedIn, checkIfPaid, getCurrentUser } from "./firebase-functions.js";


isLoggedIn()
    .then(isAuthenticated => {
        if (isAuthenticated) {
            const userId = getCurrentUser().uid;
            const productId = "product#1";
            checkIfPaid(userId, productId)
                .then(result => {
                    if (!result)
                        window.location.href = "../html/404.html";
                })
                .catch(err => console.log(err.message));
        } else {
            console.log("Need to log in to see it");
            window.location.href = "../html/404.html";
        }
    })
    .catch(err => {
        console.log(err.message)
        window.location.href = "../html/404.html";
    });
