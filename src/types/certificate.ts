export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  studentName: string;
  instructorName: string;
  completionDate: string;
  certificateNumber: string;
  workload: number; // em horas
}

export interface CertificateTemplate {
  id: string;
  name: string;
  html: string;
  css?: string;
}
