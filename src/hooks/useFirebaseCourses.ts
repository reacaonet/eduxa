import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorId: string;
  instructorName: string;
  category: string;
  duration: number;
  level: string;
  price: number;
  status: string;
  tags: string[];
  modules: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface UseFirebaseCoursesReturn {
  courses: Course[];
  featuredCourses: Course[];
  popularCourses: Course[];
  loading: boolean;
  error: string | null;
  refetchCourses: () => Promise<void>;
}

export const useFirebaseCourses = (): UseFirebaseCoursesReturn => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todos os cursos e filtrar no cliente
      const coursesQuery = query(
        collection(db, 'courses'),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(coursesQuery);
      const coursesData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(course => course.status === 'published') as Course[];

      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Filtrar cursos em destaque (usando os mais recentes)
  const featuredCourses = courses
    .slice(0, 6);

  // Filtrar cursos populares (usando os mais antigos)
  const popularCourses = [...courses]
    .reverse()
    .slice(0, 6);

  return {
    courses,
    featuredCourses,
    popularCourses,
    loading,
    error,
    refetchCourses: fetchCourses
  };
};
