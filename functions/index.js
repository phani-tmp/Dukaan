const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { setGlobalOptions } = require("firebase-functions/v2");

admin.initializeApp();

// Set default region to us-central1
setGlobalOptions({ region: "us-central1" });

exports.exchangeToken = onRequest({ cors: true }, async (req, res) => {
    try {
        // For onRequest, data is in req.body
        const { idToken, name, role } = req.body; // Accept role from frontend

        if (!idToken) {
            res.status(400).send("Missing idToken");
            return;
        }

        const decoded = await admin.auth().verifyIdToken(idToken);
        let uid = decoded.uid;
        const phone = decoded.phone_number;
        const appId = "dukaan-local-dev";

        // PHONE LOOKUP: Check if this phone number already exists in DB
        // If yes, use the EXISTING uid so we don't create "User 7", "User 8"
        if (phone) {
            try {
                // Query path: artifacts/dukaan-local-dev/public/data/users
                const usersRef = admin.firestore()
                    .collection("artifacts").doc(appId)
                    .collection("public").doc("data")
                    .collection("users");

                const snapshot = await usersRef.where("phoneNumber", "==", phone).limit(1).get();

                if (!snapshot.empty) {
                    const existingUserDoc = snapshot.docs[0];
                    console.log(`[Auth] Existing user found for phone ${phone}. OLD UID: ${existingUserDoc.id}, NEW AUTH UID: ${uid}`);

                    // CRITICAL: Switch to the OLD uid
                    uid = existingUserDoc.id;
                }
            } catch (error) {
                console.error("Error looking up user by phone:", error);
                // Fail safe: Proceed with original UID
            }
        }

        const customToken = await admin.auth().createCustomToken(uid, {
            phone,
            provider: "phone_hosted",
        });

        // Ensure user exists in Firestore (CORRECT PATH)
        // Path: artifacts/dukaan-local-dev/public/data/users/{uid}
        // User requested to revert to 'dukaan-local-dev' to preserve existing data
        // const appId = "dukaan-local-dev"; // Moved up for availability
        let finalName = name || null; // Initialize with provided name

        if (phone) {
            const userRef = admin.firestore().collection("artifacts").doc(appId).collection("public").doc("data").collection("users").doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                if (!finalName) {
                    const counterRef = admin.firestore().collection("counters").doc("users");
                    await admin.firestore().runTransaction(async (t) => {
                        const doc = await t.get(counterRef);
                        let newCount = 1;
                        if (doc.exists) {
                            newCount = doc.data().count + 1;
                        }
                        t.set(counterRef, { count: newCount });
                        finalName = `User ${newCount}`;
                    });
                }

                await userRef.set({
                    phoneNumber: phone, // FIX: Frontend expects 'phoneNumber', not 'phone'
                    name: finalName,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    provider: "phone_hosted",
                    role: role || "customer" // Use provided role or default to customer
                });
            } else {
                // User exists, retrieve their name
                finalName = userDoc.data().name;
            }
        }

        res.json({
            firebaseCustomToken: customToken,
            name: finalName // Return the name so frontend can show it
        });

    } catch (err) {
        console.error("ERROR in exchangeToken", err);
        res.status(500).send(err.message);
    }
});
