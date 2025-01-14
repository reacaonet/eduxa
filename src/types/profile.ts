import { UserRole } from './user';
import { Timestamp } from 'firebase/firestore';

export interface Profile {
  userId: string;
  email: string | null;
  displayName?: string;
  photoURL?: string | null;
  role: UserRole;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Campos adicionais específicos para cada role podem ser adicionados aqui
  bio?: string;
  phoneNumber?: string;
  address?: string;
}
