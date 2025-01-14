import { useState, useEffect } from "react";
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
import { Course } from "@/types/course";

interface UseCoursesOptions {
  pageSize?: number;
}

interface UseCoursesReturn {
  courses: Course[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  updateCourse: (courseId: string, data: Partial<Course>) => Promise<void>;
  filterCourses: (category?: string, status?: string, search?: string) => Promise<void>;
  totalCourses: number;
}

export function useCourses({ pageSize = 10 }: UseCoursesOptions = {}): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCourses, setTotalCourses] = useState(0);

  const loadCourses = async (
    categoryFilter?: string,
    statusFilter?: string,
    searchTerm?: string,
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>
  ) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(collection(db, "courses"), orderBy("createdAt", "desc"));

      if (categoryFilter && categoryFilter !== 'all') {
        q = query(q, where("category", "==", categoryFilter));
      }

      if (statusFilter && statusFilter !== 'all') {
        q = query(q, where("status", "==", statusFilter));
      }

      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      q = query(q, limit(pageSize));

      const querySnapshot = await getDocs(q);
      const newCourses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];

      // Get total count
      const totalQuery = query(collection(db, "courses"));
      const totalSnapshot = await getDocs(totalQuery);
      setTotalCourses(totalSnapshot.size);

      if (startAfterDoc) {
        setCourses((prev) => [...prev, ...newCourses]);
      } else {
        setCourses(newCourses);
      }

      setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      setHasMore(querySnapshot.docs.length === pageSize);
    } catch (err) {
      console.error("Error loading courses:", err);
      setError("Erro ao carregar cursos");
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading || !lastDoc) return;
    await loadCourses(undefined, undefined, undefined, lastDoc);
  };

  const filterCourses = async (category?: string, status?: string, search?: string) => {
    setLastDoc(null);
    await loadCourses(category, status, search);
  };

  const updateCourse = async (courseId: string, data: Partial<Course>) => {
    try {
      const courseRef = doc(db, "courses", courseId);
      await updateDoc(courseRef, {
        ...data,
        updatedAt: new Date(),
      });

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, ...data } : course
        )
      );
    } catch (err) {
      console.error("Error updating course:", err);
      throw new Error("Erro ao atualizar curso");
    }
  };

  // Load initial data
  useEffect(() => {
    loadCourses();
  }, []);

  return {
    courses,
    loading,
    error,
    hasMore,
    loadMore,
    updateCourse,
    filterCourses,
    totalCourses,
  };
}
