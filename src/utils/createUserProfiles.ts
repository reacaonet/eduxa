import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/types/user';

export const createUserProfile = async (uid: string, email: string, role: 'admin' | 'teacher' | 'student') => {
  try {
    const newProfile: UserProfile = {
      uid,
      email,
      displayName: email.split('@')[0], // Nome temporário baseado no email
      role,
      photoURL: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'users', uid), newProfile);
    localStorage.setItem('userRole', role);
    return newProfile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};
