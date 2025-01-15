import { useState, useEffect, useCallback } from "react";
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
  addDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Course, Module, Lesson } from "@/types/course";

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
  getCourses: () => Promise<Course[]>;
  getCourseById: (courseId: string) => Promise<Course | null>;
  createCourse: (courseData: Omit<Course, "id">) => Promise<Course | null>;
  deleteCourse: (courseId: string) => Promise<boolean>;
  addModule: (courseId: string, module: Omit<Module, "id">) => Promise<Module | null>;
  updateModule: (courseId: string, moduleId: string, moduleData: Partial<Module>) => Promise<boolean>;
  deleteModule: (courseId: string, moduleId: string) => Promise<boolean>;
  addLesson: (courseId: string, moduleId: string, lesson: Omit<Lesson, "id">) => Promise<boolean>;
  updateLesson: (courseId: string, moduleId: string, lessonId: string, lessonData: Partial<Lesson>) => Promise<boolean>;
  deleteLesson: (courseId: string, moduleId: string, lessonId: string) => Promise<boolean>;
  reorderModules: (courseId: string, modules: Module[]) => Promise<boolean>;
  reorderLessons: (courseId: string, moduleId: string, lessons: Lesson[]) => Promise<boolean>;
}

export function useCourses({ pageSize = 10 }: UseCoursesOptions = {}): UseCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCourses, setTotalCourses] = useState(0);

  const getCourseById = useCallback(async (courseId: string): Promise<Course | null> => {
    try {
      const courseRef = doc(db, "courses", courseId);
      const courseDoc = await getDoc(courseRef);

      if (!courseDoc.exists()) {
        return null;
      }

      return {
        id: courseDoc.id,
        ...courseDoc.data()
      } as Course;
    } catch (error) {
      console.error("Error getting course:", error);
      return null;
    }
  }, []);

  const loadCourses = useCallback(
    async (
      categoryFilter?: string,
      statusFilter?: string,
      searchTerm?: string,
      startAfterDoc?: QueryDocumentSnapshot<DocumentData>
    ) => {
      try {
        setLoading(true);
        setError(null);

        console.log("Aplicando filtros:", {
          categoryFilter,
          statusFilter,
          searchTerm
        });

        // Base query
        let baseQuery = collection(db, "courses");
        let constraints: any[] = [];

        // Add filters
        if (categoryFilter && categoryFilter !== 'all') {
          console.log("Adicionando filtro de categoria:", categoryFilter);
          constraints.push(where("category", "==", categoryFilter));
        }

        if (statusFilter && statusFilter !== 'all') {
          console.log("Adicionando filtro de status:", statusFilter);
          constraints.push(where("status", "==", statusFilter));
        }

        // Add ordering
        constraints.push(orderBy("createdAt", "desc"));

        // Create query with all constraints
        console.log("Constraints:", constraints.map(c => ({ type: c.type, field: c.field, value: c.value })));
        let q = query(baseQuery, ...constraints);

        // Add pagination
        if (startAfterDoc) {
          q = query(q, startAfter(startAfterDoc));
        }

        // Add limit
        q = query(q, limit(pageSize));

        // Execute query
        const querySnapshot = await getDocs(q);
        
        // Process results
        let filteredCourses = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];

        console.log("Cursos encontrados:", filteredCourses.length);

        // Apply text search filter in memory if needed
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredCourses = filteredCourses.filter((course) => 
            course.title?.toLowerCase().includes(searchLower) ||
            course.description?.toLowerCase().includes(searchLower) ||
            course.shortDescription?.toLowerCase().includes(searchLower)
          );
          console.log("Cursos após filtro de texto:", filteredCourses.length);
        }

        // Update state
        if (startAfterDoc) {
          setCourses((prev) => [...prev, ...filteredCourses]);
        } else {
          setCourses(filteredCourses);
        }

        // Update pagination state
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
        setHasMore(querySnapshot.docs.length === pageSize);

        // Get total count
        const totalQuery = query(baseQuery, ...constraints.filter(c => c.type !== "limit" && c.type !== "startAfter"));
        const totalSnapshot = await getDocs(totalQuery);
        setTotalCourses(totalSnapshot.size);

      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Failed to load courses");
        setCourses([]); // Clear courses on error
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  const loadMore = useCallback(async () => {
    if (!lastDoc) return;
    await loadCourses(undefined, undefined, undefined, lastDoc);
  }, [lastDoc, loadCourses]);

  const filterCourses = useCallback(
    async (category?: string, status?: string, search?: string) => {
      setLastDoc(null); // Reset pagination when applying new filters
      await loadCourses(category, status, search);
    },
    [loadCourses]
  );

  const getCourses = useCallback(async (): Promise<Course[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Course[];
    } catch (error) {
      console.error("Error getting courses:", error);
      return [];
    }
  }, []);

  const createCourse = useCallback(async (courseData: Omit<Course, "id">): Promise<Course | null> => {
    try {
      const docRef = await addDoc(collection(db, "courses"), courseData);
      return {
        id: docRef.id,
        ...courseData,
      };
    } catch (error) {
      console.error("Error creating course:", error);
      return null;
    }
  }, []);

  const updateCourse = useCallback(async (courseId: string, data: Partial<Course>): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "courses", courseId), data);
      return true;
    } catch (error) {
      console.error("Error updating course:", error);
      return false;
    }
  }, []);

  const deleteCourse = useCallback(async (courseId: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "courses", courseId));
      return true;
    } catch (error) {
      console.error("Error deleting course:", error);
      return false;
    }
  }, []);

  const addModule = useCallback(async (courseId: string, module: Omit<Module, "id">): Promise<Module | null> => {
    try {
      const course = await getCourseById(courseId);
      if (!course) return null;

      const modules = course.modules || [];
      const newModule = {
        ...module,
        id: Date.now().toString(),
        order: modules.length,
      };

      await updateDoc(doc(db, "courses", courseId), {
        modules: [...modules, newModule],
      });

      return newModule;
    } catch (error) {
      console.error("Error adding module:", error);
      return null;
    }
  }, [getCourseById]);

  const updateModule = useCallback(async (courseId: string, moduleId: string, moduleData: Partial<Module>): Promise<boolean> => {
    try {
      const course = await getCourseById(courseId);
      if (!course || !course.modules) return false;

      const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
      if (moduleIndex === -1) return false;

      const updatedModules = [...course.modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        ...moduleData,
      };

      await updateDoc(doc(db, "courses", courseId), {
        modules: updatedModules,
      });

      return true;
    } catch (error) {
      console.error("Error updating module:", error);
      return false;
    }
  }, [getCourseById]);

  const deleteModule = useCallback(async (courseId: string, moduleId: string): Promise<boolean> => {
    try {
      const course = await getCourseById(courseId);
      if (!course || !course.modules) return false;

      const updatedModules = course.modules.filter((m) => m.id !== moduleId);

      await updateDoc(doc(db, "courses", courseId), {
        modules: updatedModules,
      });

      return true;
    } catch (error) {
      console.error("Error deleting module:", error);
      return false;
    }
  }, [getCourseById]);

  const addLesson = useCallback(async (courseId: string, moduleId: string, lesson: Omit<Lesson, "id">): Promise<boolean> => {
    try {
      const course = await getCourseById(courseId);
      if (!course || !course.modules) return false;

      const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
      if (moduleIndex === -1) return false;

      const updatedModules = [...course.modules];
      const module = updatedModules[moduleIndex];
      const lessons = module.lessons || [];

      const newLesson = {
        ...lesson,
        id: Date.now().toString(),
        order: lessons.length,
      };

      updatedModules[moduleIndex] = {
        ...module,
        lessons: [...lessons, newLesson],
      };

      await updateDoc(doc(db, "courses", courseId), {
        modules: updatedModules,
      });

      return true;
    } catch (error) {
      console.error("Error adding lesson:", error);
      return false;
    }
  }, [getCourseById]);

  const updateLesson = useCallback(async (courseId: string, moduleId: string, lessonId: string, lessonData: Partial<Lesson>): Promise<boolean> => {
    try {
      const course = await getCourseById(courseId);
      if (!course || !course.modules) return false;

      const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
      if (moduleIndex === -1) return false;

      const updatedModules = [...course.modules];
      const module = updatedModules[moduleIndex];
      const lessons = module.lessons || [];

      const lessonIndex = lessons.findIndex((l) => l.id === lessonId);
      if (lessonIndex === -1) return false;

      lessons[lessonIndex] = {
        ...lessons[lessonIndex],
        ...lessonData,
      };

      updatedModules[moduleIndex] = {
        ...module,
        lessons,
      };

      await updateDoc(doc(db, "courses", courseId), {
        modules: updatedModules,
      });

      return true;
    } catch (error) {
      console.error("Error updating lesson:", error);
      return false;
    }
  }, [getCourseById]);

  const deleteLesson = useCallback(async (courseId: string, moduleId: string, lessonId: string): Promise<boolean> => {
    try {
      const course = await getCourseById(courseId);
      if (!course || !course.modules) return false;

      const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
      if (moduleIndex === -1) return false;

      const updatedModules = [...course.modules];
      const module = updatedModules[moduleIndex];
      const lessons = module.lessons || [];

      updatedModules[moduleIndex] = {
        ...module,
        lessons: lessons.filter((l) => l.id !== lessonId),
      };

      await updateDoc(doc(db, "courses", courseId), {
        modules: updatedModules,
      });

      return true;
    } catch (error) {
      console.error("Error deleting lesson:", error);
      return false;
    }
  }, [getCourseById]);

  const reorderModules = useCallback(async (courseId: string, modules: Module[]): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "courses", courseId), {
        modules: modules.map((module, index) => ({ ...module, order: index })),
      });
      return true;
    } catch (error) {
      console.error("Error reordering modules:", error);
      return false;
    }
  }, []);

  const reorderLessons = useCallback(async (courseId: string, moduleId: string, lessons: Lesson[]): Promise<boolean> => {
    try {
      const course = await getCourseById(courseId);
      if (!course || !course.modules) return false;

      const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
      if (moduleIndex === -1) return false;

      const updatedModules = [...course.modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        lessons: lessons.map((lesson, index) => ({ ...lesson, order: index })),
      };

      await updateDoc(doc(db, "courses", courseId), {
        modules: updatedModules,
      });

      return true;
    } catch (error) {
      console.error("Error reordering lessons:", error);
      return false;
    }
  }, [getCourseById]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return {
    courses,
    loading,
    error,
    hasMore,
    loadMore,
    updateCourse,
    filterCourses,
    totalCourses,
    getCourses,
    getCourseById,
    createCourse,
    deleteCourse,
    addModule,
    updateModule,
    deleteModule,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderModules,
    reorderLessons,
  };
}
