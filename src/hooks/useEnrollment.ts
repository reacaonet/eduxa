import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolledAt: Date;
  progress: {
    completedLessons: string[];
    lastAccessedLesson: string;
    lastAccessedAt: Date;
  };
}

export const useEnrollment = (courseId: string) => {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getUserEnrollments = useCallback(async (userId: string) => {
    try {
      const enrollmentQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(enrollmentQuery);
      const enrollments = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          enrolledAt: data.enrolledAt?.toDate() || new Date(),
          progress: {
            ...data.progress,
            lastAccessedAt: data.progress?.lastAccessedAt?.toDate() || new Date()
          }
        } as Enrollment;
      });

      return enrollments;
    } catch (err) {
      console.error('Error fetching user enrollments:', err);
      throw err;
    }
  }, []); // Esta função não depende de nenhum estado do hook

  const checkEnrollment = useCallback(async () => {
    if (!user) {
      setEnrollment(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const enrollmentQuery = query(
        collection(db, 'enrollments'),
        where('userId', '==', user.uid),
        where('courseId', '==', courseId),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(enrollmentQuery);
      
      if (querySnapshot.empty) {
        setEnrollment(null);
      } else {
        const enrollmentData = querySnapshot.docs[0].data() as Enrollment;
        setEnrollment({
          ...enrollmentData,
          id: querySnapshot.docs[0].id,
          enrolledAt: enrollmentData.enrolledAt?.toDate() || new Date(),
          progress: {
            ...enrollmentData.progress,
            lastAccessedAt: enrollmentData.progress?.lastAccessedAt?.toDate() || new Date()
          }
        });
      }
    } catch (err) {
      console.error('Error checking enrollment:', err);
      setError('Failed to check enrollment status');
      setEnrollment(null);
    } finally {
      setLoading(false);
    }
  }, [user, courseId]);

  useEffect(() => {
    checkEnrollment();
  }, [checkEnrollment]);

  return {
    isEnrolled: !!enrollment,
    enrollment,
    loading,
    error,
    getUserEnrollments
  };
};
