import { Timestamp } from 'firebase/firestore';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface BaseUser {
  email: string;
  name: string;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  bio?: string;
  phone?: string;
}

export interface StudentUser extends BaseUser {
  role: 'student';
  id: string;
  status: 'active' | 'inactive';
}

export interface TeacherUser extends BaseUser {
  role: 'teacher';
}

export interface AdminUser extends BaseUser {
  role: 'admin';
  id: string;
}

export type User = StudentUser | TeacherUser | AdminUser;
