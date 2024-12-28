/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { onInit } = require('firebase-functions/v2/core');
const { defineString, defineSecret } = require('firebase-functions/params');

const logger = require("firebase-functions/logger");

const admin = require('firebase-admin');

admin.initializeApp();

const stripeApiKey = defineString("STRIPE_API_KEY");
const stripeWhApiKey = defineString("STRIPE_WH_API_KEY");

const successUrl = defineString("SUCCESS_URL");
const cancelUrl = defineString("CANCEL_URL");

let STRIPE_API_KEY;
let STRIPE_WH_API_KEY;

let SUCCESS_URL;
let CANCEL_URL;
onInit(() => {
    STRIPE_API_KEY = stripeApiKey.value();
    STRIP_WH_API_KEY = stripeWhApiKey.value();

    SUCCESS_URL = successUrl.value();
    CANCEL_URL = cancelUrl.value();
})

exports.stripeCheckout = onCall(async (req, res) => {
    const userId = req.data.userId;
    const productId = req.data.productId;

    if (userId == undefined || productId == undefined) {
        logger.error("userId or productId is not found");
        throw new HttpsError("invalid-argument", "userId or productId is not found");
    }

    try {
        const productRef = await admin.firestore().collection("products");
        const productSnapshot = await productRef
            .where("productId", "==", productId)
            .get();

        if (productSnapshot.empty) {
            logger.info("productId (" + productId + ") not found");
            throw new HttpsError("internal", "Product with provided id (" + productId + ") is not found");
        }

        const product = productSnapshot.docs[0].data();
        const stripe = require("stripe")(STRIPE_API_KEY);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: SUCCESS_URL,
            cancel_url: CANCEL_URL,
            shipping_address_collection: {
                allowed_countries: ["US"],
            },
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: "usd",
                        unit_amount: product.productPrice * 100, // 10000 = 100 USD
                        product_data: {
                            name: product.productName,
                        },
                    },
                }
            ],
            metadata: {
                userId: userId,
                productId: product.productId
            }
        });
        return {
            id: session.id,
        };
    } catch (err) {
        logger.error(err.message);
        throw new HttpsError("internal", err.message);
    }
});

exports.stripeWebHook = onRequest(async (req, res) => {
    const stripe = require("stripe")(STRIPE_API_KEY);
    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            req.headers["stripe-signature"],
            STRIP_WH_API_KEY,
        );
    } catch (err) {
        logger.error(err.message);
        console.error("Webhook signature verification failed.");
        res.sendStatus(400);
        return;
    }

    const dataObject = event.data.object;

    const shipping = dataObject.shipping == undefined
        ? dataObject.customer_details
        : dataObject.shipping

    await admin.firestore().collection("payments").doc().set({
        checkoutSessionId: dataObject.id,
        status: dataObject.payment_status,
        shippingInfo: shipping,
        amountTotal: dataObject.amount_total,
        userId: dataObject.metadata.userId,
        productId: dataObject.metadata.productId
    });
    res.sendStatus(200);
});
