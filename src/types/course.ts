import { User } from "./user";

export interface Course {
  id?: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: string;
  subcategory?: string;
  price: number;
  thumbnail: string;
  status: "draft" | "published";
  instructor: {
    id: string;
    name: string;
    email: string | null;
  };
  duration?: string;
  level?: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  learningObjectives?: string[];
  language?: string;
  features?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  modules: {
    id: string;
    title: string;
    description?: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      description?: string;
      duration?: string;
      type: "video" | "text" | "quiz";
      content?: string;
      order: number;
    }[];
  }[];
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
  certificateAvailable?: boolean;
  supportEmail?: string;
  faq?: {
    question: string;
    answer: string;
  }[];
}
