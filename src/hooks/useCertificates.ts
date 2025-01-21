import { useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Certificate } from '@/types/certificate';
import { v4 as uuidv4 } from 'uuid';

export function useCertificates() {
  const generateCertificate = useCallback(async (
    userId: string,
    courseId: string,
  ): Promise<Certificate | null> => {
    try {
      // Verificar se o certificado já existe
      const certificatesRef = collection(db, 'certificates');
      const q = query(
        certificatesRef,
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const existingCerts = await getDocs(q);
      
      if (!existingCerts.empty) {
        // Retornar o certificado existente
        const certDoc = existingCerts.docs[0];
        return { id: certDoc.id, ...certDoc.data() } as Certificate;
      }

      // Buscar dados do curso
      const courseRef = doc(db, 'courses', courseId);
      const courseSnap = await getDoc(courseRef);
      if (!courseSnap.exists()) {
        throw new Error('Curso não encontrado');
      }
      const courseData = courseSnap.data();

      // Buscar dados do usuário
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('Usuário não encontrado');
      }
      const userData = userSnap.data();

      // Criar novo certificado
      const certificate: Certificate = {
        id: uuidv4(),
        userId,
        courseId,
        courseName: courseData.title,
        studentName: userData.name || 'Aluno',
        instructorName: courseData.instructorName || 'Instrutor',
        completionDate: new Date().toISOString(),
        certificateNumber: `CERT-${uuidv4().slice(0, 8).toUpperCase()}`,
        workload: courseData.workload || 40,
      };

      // Salvar no Firestore
      const docRef = await addDoc(certificatesRef, certificate);
      
      return { ...certificate, id: docRef.id };
    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      return null;
    }
  }, []);

  const getCertificate = useCallback(async (
    userId: string,
    courseId: string
  ): Promise<Certificate | null> => {
    try {
      const certificatesRef = collection(db, 'certificates');
      const q = query(
        certificatesRef,
        where('userId', '==', userId),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const certDoc = querySnapshot.docs[0];
      return { id: certDoc.id, ...certDoc.data() } as Certificate;
    } catch (error) {
      console.error('Erro ao buscar certificado:', error);
      return null;
    }
  }, []);

  return {
    generateCertificate,
    getCertificate,
  };
}
