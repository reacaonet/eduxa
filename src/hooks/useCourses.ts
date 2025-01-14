import { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  image: string;
  category: string;
  featured?: boolean;
  popularity?: number;
}

export const useCourses = () => {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch featured courses
        const featuredQuery = query(
          collection(db, 'courses'),
          where('featured', '==', true),
          limit(4)
        );
        const featuredSnapshot = await getDocs(featuredQuery);
        const featuredData = featuredSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        setFeaturedCourses(featuredData);

        // Fetch popular courses
        const popularQuery = query(
          collection(db, 'courses'),
          orderBy('popularity', 'desc'),
          limit(4)
        );
        const popularSnapshot = await getDocs(popularQuery);
        const popularData = popularSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[];
        setPopularCourses(popularData);

        // Fetch categories
        const categoriesQuery = query(collection(db, 'categories'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          name: doc.id,
          count: doc.data().count
        }));
        setCategories(categoriesData);

      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return {
    featuredCourses,
    popularCourses,
    categories,
    loading,
    error
  };
};
