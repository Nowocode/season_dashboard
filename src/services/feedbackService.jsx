import { db } from "../firebase";
import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    doc,
    setDoc,
    deleteDoc,
    query,
    where,
    writeBatch,
    orderBy
} from "firebase/firestore";

const FEEDBACKS_COLLECTION = "feedbacks";
const RESPONSES_COLLECTION = "responses";

export const feedbackService = {
    // Create a new feedback
    async createFeedback(feedbackData) {
        const collectionRef = collection(db, FEEDBACKS_COLLECTION);
        const docRef = doc(collectionRef);
        await setDoc(docRef, {
            ...feedbackData,
            id: docRef.id,
            isAvailable: false, // Default to false
        });
        return docRef.id;
    },

    // Update an existing feedback
    async updateFeedback(id, feedbackData) {
        const docRef = doc(db, FEEDBACKS_COLLECTION, id);
        await updateDoc(docRef, {
            ...feedbackData,
        });
    },

    // Delete a feedback
    async deleteFeedback(id) {
        const docRef = doc(db, FEEDBACKS_COLLECTION, id);
        await deleteDoc(docRef);
    },

    // Get all feedbacks
    async getFeedbacks() {
        console.log("Fetching feedbacks from collection:", FEEDBACKS_COLLECTION);
        const q = query(collection(db, FEEDBACKS_COLLECTION));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Feedbacks fetched:", data);
        return data;
    },

    // Set a feedback as the only available one
    async setAvailable(feedbackId) {
        const batch = writeBatch(db);

        // 1. Find the currently available feedback
        const q = query(collection(db, FEEDBACKS_COLLECTION), where("isAvailable", "==", true));
        const querySnapshot = await getDocs(q);

        // 2. Set all currently available to false
        querySnapshot.forEach((document) => {
            batch.update(doc(db, FEEDBACKS_COLLECTION, document.id), { isAvailable: false });
        });

        // 3. Set the target feedback to true
        batch.update(doc(db, FEEDBACKS_COLLECTION, feedbackId), { isAvailable: true });

        await batch.commit();
    },

    // Get all responses
    async getResponses() {
        console.log("Fetching responses from collection:", RESPONSES_COLLECTION);
        const q = query(collection(db, RESPONSES_COLLECTION));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Responses fetched:", data);
        return data;
    },
};
