import { collection, addDoc, Timestamp, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

interface EnrollmentData {
  userId: string;
  courseId: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: {
    completedLessons: string[];
    lastAccessedLesson: string | null;
    lastAccessedAt: Timestamp;
  };
}

export const enrollUserInCourse = async (userId: string, courseId: string) => {
  try {
    const enrollmentData: EnrollmentData = {
      userId,
      courseId,
      status: 'active',
      progress: {
        completedLessons: [],
        lastAccessedLesson: null,
        lastAccessedAt: Timestamp.now()
      }
    };

    const docRef = await addDoc(collection(db, 'enrollments'), enrollmentData);
    return docRef.id;
  } catch (error) {
    console.error('Error enrolling user in course:', error);
    throw error;
  }
};

export const updateLessonProgress = async (
  enrollmentId: string,
  lessonId: string,
  completed: boolean
) => {
  try {
    const enrollmentRef = doc(db, 'enrollments', enrollmentId);
    
    await updateDoc(enrollmentRef, {
      'progress.lastAccessedLesson': lessonId,
      'progress.lastAccessedAt': Timestamp.now(),
      'progress.completedLessons': completed 
        ? arrayUnion(lessonId)
        : arrayRemove(lessonId)
    });
  } catch (error) {
    console.error('Error updating lesson progress:', error);
    throw error;
  }
};
