import { firebaseSignUp } from "./firebase-functions.js"

document.getElementById("sign_up_button").addEventListener("click", function(event) {
    event.preventDefault();
    const email = document.getElementById("email_input").value;
    const password = document.getElementById("password_input").value;

    firebaseSignUp(email, password)
        .then(user => {
            console.log("Signed up successfully");
            window.location.href = "../index.html";
        })
        .catch(error => {
            console.log("Can not sign in. Error message: " + error.message);
        })
});
