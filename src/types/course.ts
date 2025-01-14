import { User } from "./user";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor?: User;
  image: string;
  category: string;
  price: number;
  status: "published" | "draft" | "archived";
  featured?: boolean;
  popularity?: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  updatedAt?: {
    seconds: number;
    nanoseconds: number;
  };
}
