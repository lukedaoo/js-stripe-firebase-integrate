import { firebaseLogin } from "./firebase-functions.js"

document.getElementById("login_button").addEventListener("click", function(event) {
    event.preventDefault();
    const email = document.getElementById("email_input").value;
    const password = document.getElementById("password_input").value;

    firebaseLogin(email, password)
        .then(user => {
            console.log("Signed in");
            window.location.href = "../index.html";
        })
        .catch(error => {
            console.log("Can not signed in. Error message: " + error);
        })
});

document.getElementById("signup_new_button").addEventListener("click", function() {
    window.location.href = "../html/sign-up.html";
});
