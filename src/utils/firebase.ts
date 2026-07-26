import { initializeApp, getApps, cert } from "firebase-admin/app";
import path from "path";

// Path to the service account file
const serviceAccountPath = path.join(process.cwd(), "config", "djarna-b212e-firebase-adminsdk-fbsvc-ed19886f3e.json");

// Initialize only once
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccountPath),
    });
}
