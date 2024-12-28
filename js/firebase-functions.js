import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js'
import { getAuth, signOut, updateProfile, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js'
import { getFirestore, doc, addDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-functions.js";

const firebaseApp = initializeApp(FIREBASE);
const db = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);

export function getStripeCheckOutFunc() {
    return httpsCallable(functions, "stripeCheckout");
}

export function isLoggedIn() {
    return new Promise((resolve, reject) => {
        getAuth(firebaseApp).onAuthStateChanged(user => {
            if (user) { resolve(true); }
            else { resolve(false) }
        })
    });
}

export function firebaseLogin(email, password) {
    return new Promise((resolve, reject) => {
        signInWithEmailAndPassword(getAuth(firebaseApp), email, password)
            .then(userCredential => {
                resolve(userCredential.user);
            })
            .catch(error => {
                reject(error);
            })
    })
}

export function firebaseSignUp(email, password) {
    return new Promise((resolve, reject) => {
        createUserWithEmailAndPassword(getAuth(firebaseApp), email, password)
            .then(userCredential => {
                resolve(userCredential.user);
            })
            .catch(error => {
                reject(error);
            })
    })
}

export function getCurrentUser() {
    return getAuth(firebaseApp).currentUser;
}

export function firebaseLogOut() {
    return new Promise((resolve, reject) => {
        signOut(getAuth(firebaseApp))
            .then(() => resolve(true))
            .catch(err => reject(err));
    });
}

export function updateUserPaymentStatus(userId, contentId, status) {
    const paymentsRef = collection(db, "payments");

    return addDoc(paymentsRef, {
        userId: userId,
        contentId: contentId,
        status: status,
        atTime: new Date(),
    })
}

export function getPayment(userId, contentId) {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef,
        where("userId", "==", userId),
        where("productId", "==", contentId));

    return getDocs(q)
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                return querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                console.log("No documents found");
            }
        })
        .catch((error) => {
            console.error("Error getting payment", error.message);
        });
}

export function getProduct(productId) {
    const productsRef = collection(db, "products");
    const q = query(productsRef,
        where("productId", "==", productId));

    return getDocs(q)
        .then((querySnapshot) => {
            if (!querySnapshot.empty) {
                return querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }));
            } else {
                console.log("No documents found");
            }
        })
        .catch((error) => {
            console.error("Error getting products", error.message);
        });
}

export function addProduct(product) {
    const productsRef = collection(db, "products");

    return addDoc(productsRef, {
        productId: product.productId,
        productName: product.productName,
        productPrice: product.productPrice
    })
}

export function checkIfPaid(userId, productId) {

    return new Promise((resolve, reject) => {
        const paymentsRef = collection(db, "payments");
        const q = query(paymentsRef,
            where("userId", "==", userId),
            where("productId", "==", productId),
            where("status", "==", "paid")
        );
        getDocs(q)
            .then(querySnapshot => {
                if (!querySnapshot.empty) {
                    console.log("User has already paid for this content.");
                    resolve(true);
                } else {
                    console.log("User has not paid for this content.");
                    resolve(false);
                }
            })
            .catch(err => reject(err));
    });
}

