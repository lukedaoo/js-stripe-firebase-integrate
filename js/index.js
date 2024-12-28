import {
    isLoggedIn, getCurrentUser, firebaseLogOut, checkIfPaid,
    updateUserPaymentStatus, addProduct, getProduct,
    getStripeCheckOutFunc
} from "./firebase-functions.js"



async function addExampleProduct() {
    const product_1 = await getProduct("product#1");
    if (product_1 == undefined ||
        (product_1 != null && product_1.length == 0)) {
        addProduct({ productId: "product#1", productName: "AP Test", productPrice: 10 })
            .then(() => { });
    }

    const product_2 = await getProduct("product#2");
    if (product_2 == undefined ||
        (product_2 != null && product_2.length == 0)) {
        addProduct({ productId: "product#2", productName: "AP Test 2", productPrice: 10 })
            .then(() => { });
    }
}

addExampleProduct();

document.getElementById("free_button").addEventListener("click", function() {
    isLoggedIn()
        .then(isAuthenticate => {
            if (isAuthenticate) {
                console.log("Logged in");
                window.location.href = "./html/free-content.html";
            } else {
                window.location.href = "./html/login.html";
            }
        })
});

function handleCheckout(userId, productId) {
    const stripe = Stripe(STRIPE.publicKey);
    const checkoutFunc = getStripeCheckOutFunc()
    checkoutFunc({ userId: userId, productId: productId })
        .then(response => {
            const sessionId = response.data.id;
            stripe.redirectToCheckout({ sessionId: sessionId });
        });
}

async function handlePayment() {
    try {
        const isAuthenticate = await isLoggedIn();

        if (!isAuthenticate) {
            window.location.href = "./html/login.html";
            return;
        }
        console.log("Logged in");
        const user = getCurrentUser();

        const userId = user.uid;
        const productId = "product#1";

        const result = await checkIfPaid(user.uid, productId);

        if (result) {
            window.location.href = "../html/pay-content.html";
        } else {

            // await updateUserPaymentStatus(user.uid, "content-id-test-1", "paid");
            // window.location.href = "../html/pay-content.html";
            handleCheckout(userId, productId);
        }
    } catch (err) {
        console.log(err.message);
    }
}

document.getElementById("pay_button").addEventListener("click", function() {
    handlePayment();
});

document.getElementById("logout_button").addEventListener("click", function() {
    firebaseLogOut()
        .then(success => window.location.reload())
        .catch(err => console.log(err.messsage));
});

isLoggedIn()
    .then(isAuthenticate => {
        if (isAuthenticate) {
            document.getElementById("logout_button").style = "display: block;";
            const currentUser = getCurrentUser();
            document.getElementById("welcome_text").innerHTML = "Welcome, " + currentUser.displayName;
        } else {
            document.getElementById("logout_button").style = "display: none;";
        }
    })
    .catch(err => {
        document.getElementById("logout_button").style = "display: none;";
    });
