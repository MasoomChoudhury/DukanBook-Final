import firebase from 'firebase/compat/app';
import { db, auth } from '../firebaseConfig';
import type { BusinessProfile } from '../types';

const googleProvider = new firebase.auth.GoogleAuthProvider();

export const createInitialProfile = async (user: { uid: string; email: string | null; displayName: string | null; }) => {
     const userDocRef = db.collection('users').doc(user.uid);
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) {
       const initialProfile: BusinessProfile = {
            name: user.displayName || "Your Company Name",
            address: "123 Business St, City, State, 123456",
            gstin: "YOUR_GSTIN_HERE",
            contact: user.email || "your-email@business.com",
            state: "Maharashtra"
        };
        await userDocRef.set({ businessProfile: initialProfile });
    }
}

export const signUpWithEmail = async (email: string, password: string): Promise<void> => {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    if (userCredential.user) {
        await createInitialProfile(userCredential.user);
    }
};

export const signInWithEmail = async (email: string, password: string): Promise<void> => {
    await auth.signInWithEmailAndPassword(email, password);
};

export const signInWithGoogle = async (): Promise<void> => {
    const result = await auth.signInWithPopup(googleProvider);
    if (result.user && result.additionalUserInfo?.isNewUser) {
        await createInitialProfile(result.user);
    }
};

export const logout = async (): Promise<void> => {
    await auth.signOut();
};