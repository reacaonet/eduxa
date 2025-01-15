import { User } from "./user";

export interface Course {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  subcategory?: string;
  price: number;
  thumbnail: string;
  status: "draft" | "published" | "archived";
  instructor: {
    id: string;
    name: string;
    email: string | null;
  };
  duration: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  supportEmail: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
  certificateAvailable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  modules?: Module[];
  enrolledStudents: number;
  rating: number;
  reviews: {
    id: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  faq?: {
    question: string;
    answer: string;
  }[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number; // em minutos
  type: 'video' | 'text' | 'quiz';
  content: string;
}
