import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  status: 'active' | 'completed' | 'cancelled';
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

  useEffect(() => {
    const checkEnrollment = async () => {
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
            enrolledAt: enrollmentData.enrolledAt.toDate(),
            progress: {
              ...enrollmentData.progress,
              lastAccessedAt: enrollmentData.progress.lastAccessedAt.toDate()
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
    };

    checkEnrollment();
  }, [user, courseId]);

  return {
    isEnrolled: !!enrollment,
    enrollment,
    loading,
    error
  };
};
