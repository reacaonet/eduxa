import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { User, UserRole } from '@/types/user';

export const useProfile = () => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "users", user.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setProfile(data as User);
          if (data.role) {
            localStorage.setItem('userRole', data.role);
          }
        } else {
          setProfile(null);
          localStorage.removeItem('userRole');
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user:", error);
        setError("Erro ao carregar perfil");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createProfile = async (profileData: { name: string; role: UserRole }) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      const userRef = doc(db, "users", user.uid);
      const baseUser = {
        email: user.email,
        name: profileData.name,
        role: profileData.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        bio: "",
        phone: ""
      };

      let userData;
      switch (profileData.role) {
        case 'student':
          userData = {
            ...baseUser,
            id: user.uid,
            status: 'active'
          };
          break;
        case 'teacher':
          userData = {
            ...baseUser
          };
          break;
        case 'admin':
          userData = {
            ...baseUser,
            id: user.uid
          };
          break;
        default:
          throw new Error("Role inválida");
      }

      await setDoc(userRef, userData);
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw new Error("Erro ao criar perfil");
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) throw new Error("Usuário não autenticado");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error("Erro ao atualizar perfil");
    }
  };

  return {
    profile,
    loading,
    error,
    createProfile,
    updateProfile,
  };
};
