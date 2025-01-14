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
  updateCourse: (courseId: string, data: Partial<Course>) => Promise<boolean>;
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
      
      // Processar campos especiais
      const processedData: Record<string, any> = {
        updatedAt: new Date(),
      };

      // Processar apenas campos que existem no data
      if (data.title) processedData.title = data.title;
      if (data.description) processedData.description = data.description;
      if (data.shortDescription) processedData.shortDescription = data.shortDescription;
      if (data.category) processedData.category = data.category;
      if (data.subcategory) processedData.subcategory = data.subcategory;
      if (data.price) processedData.price = parseFloat(data.price.toString());
      if (data.image) processedData.image = data.image;
      if (data.status) processedData.status = data.status;
      if (data.duration) processedData.duration = data.duration;
      if (data.level) processedData.level = data.level;
      if (data.language) processedData.language = data.language;
      if (data.supportEmail) processedData.supportEmail = data.supportEmail;
      
      // Processar arrays e campos especiais apenas se existirem
      if (data.prerequisites) {
        processedData.prerequisites = typeof data.prerequisites === 'string' 
          ? data.prerequisites.split('\n').filter(Boolean)
          : data.prerequisites;
      }
      
      if (data.learningObjectives) {
        processedData.learningObjectives = typeof data.learningObjectives === 'string'
          ? data.learningObjectives.split('\n').filter(Boolean)
          : data.learningObjectives;
      }
      
      if (data.tags) {
        processedData.tags = typeof data.tags === 'string'
          ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          : data.tags;
      }

      // Tratar o certificateAvailable como booleano
      if (data.certificateAvailable !== undefined) {
        processedData.certificateAvailable = data.certificateAvailable === 'on' || data.certificateAvailable === true;
      }

      await updateDoc(courseRef, processedData);
      
      // Atualizar o cache do React Query
      // queryClient.invalidateQueries(['courses']);
      
      return true;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
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
