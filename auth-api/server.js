const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

app.post("/api/exchange", async (req, res) => {
    try {
        const { idToken, name } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: "Missing idToken" });
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        const phone = decodedToken.phone_number;

        const firebaseCustomToken = await admin.auth().createCustomToken(uid, {
            phone,
            provider: "phone_hosted",
        });

        // Ensure user exists in Firestore
        if (phone) {
            const userRef = admin.firestore().collection("users").doc(uid);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                let finalName = name;

                // If no name provided, generate sequential name (User 1, User 2...)
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
                    phone,
                    name: finalName,
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    provider: "phone_hosted",
                    role: "customer"
                });
            }
        }

        return res.json({ firebaseCustomToken });

    } catch (error) {
        console.error("Error exchanging token:", error);
        return res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
