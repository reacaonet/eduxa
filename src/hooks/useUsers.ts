import { useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  startAfter,
  limit,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { User } from "@/types/user";

interface UseUsersOptions {
  pageSize?: number;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  filterUsers: (role?: string, status?: string, search?: string) => Promise<void>;
  totalUsers: number;
}

export function useUsers({ pageSize = 10 }: UseUsersOptions = {}): UseUsersReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);

  const loadUsers = async (
    roleFilter?: string,
    statusFilter?: string,
    searchTerm?: string,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>
  ) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(collection(db, "users"), orderBy("createdAt", "desc"));

      if (roleFilter && roleFilter !== 'all') {
        q = query(q, where("role", "==", roleFilter));
      }

      if (statusFilter && statusFilter !== 'all') {
        q = query(q, where("status", "==", statusFilter));
      }

      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      q = query(q, limit(pageSize));

      const querySnapshot = await getDocs(q);
      const newUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];

      // Get total count
      const totalQuery = query(collection(db, "users"));
      const totalSnapshot = await getDocs(totalQuery);
      setTotalUsers(totalSnapshot.size);

      if (startAfterDoc) {
        setUsers((prev) => [...prev, ...newUsers]);
      } else {
        setUsers(newUsers);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === pageSize);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading || !lastDoc) return;
    await loadUsers(undefined, undefined, undefined, lastDoc);
  };

  const filterUsers = async (role?: string, status?: string, search?: string) => {
    setLastDoc(null);
    await loadUsers(role, status, search);
  };

  const updateUser = async (userId: string, data: Partial<User>) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...data } : user
        )
      );
    } catch (err) {
      console.error("Error updating user:", err);
      throw new Error("Erro ao atualizar usuário");
    }
  };

  // Load initial data
  useState(() => {
    loadUsers();
  });

  return {
    users,
    loading,
    error,
    hasMore,
    loadMore,
    updateUser,
    filterUsers,
    totalUsers,
  };
}
