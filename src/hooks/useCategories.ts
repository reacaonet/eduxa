import { useState, useEffect, useCallback } from "react";
import { collection, getDocs, addDoc, updateDoc, doc, deleteField } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CategoryFormData {
  name: string;
  description?: string;
  isActive: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
      
      // Ordenar por nome
      const sortedCategories = categoriesData.sort((a, b) => 
        a.name.localeCompare(b.name)
      );

      setCategories(sortedCategories);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = async (data: CategoryFormData) => {
    try {
      setError(null);
      // Criar objeto com apenas os campos necessários
      const categoryData = {
        name: data.name.trim(),
        description: data.description?.trim() || "",
        slug: data.name.toLowerCase().trim().replace(/\s+/g, '-'),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await addDoc(collection(db, "categories"), categoryData);
      await loadCategories();
      return docRef.id;
    } catch (err) {
      console.error("Error adding category:", err);
      setError("Failed to add category");
      throw err;
    }
  };

  const updateCategory = async (id: string, data: Partial<CategoryFormData>) => {
    try {
      setError(null);
      // Criar objeto com apenas os campos necessários
      const updateData: Record<string, any> = {
        updatedAt: new Date()
      };

      if (data.name !== undefined) {
        updateData.name = data.name.trim();
        updateData.slug = data.name.toLowerCase().trim().replace(/\s+/g, '-');
      }

      if (data.description !== undefined) {
        updateData.description = data.description.trim();
      }

      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      // Remover o campo order se existir
      updateData.order = deleteField();

      const categoryRef = doc(db, "categories", id);
      await updateDoc(categoryRef, updateData);
      await loadCategories();
    } catch (err) {
      console.error("Error updating category:", err);
      setError("Failed to update category");
      throw err;
    }
  };

  return { categories, loading, error, addCategory, updateCategory };
}
