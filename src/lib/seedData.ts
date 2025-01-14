import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';

const sampleCourses = [
  {
    title: "Web Development Fundamentals",
    description: "Learn the basics of web development with HTML, CSS, and JavaScript.",
    instructor: "John Doe",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=500&auto=format",
    category: "Development",
    featured: true,
    popularity: 100
  },
  {
    title: "Data Science Essentials",
    description: "Master the fundamentals of data science and analytics.",
    instructor: "Jane Smith",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format",
    category: "Data Science",
    featured: true,
    popularity: 95
  },
  {
    title: "Digital Marketing Strategy",
    description: "Learn modern digital marketing techniques and strategies.",
    instructor: "Mike Johnson",
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=500&auto=format",
    category: "Marketing",
    featured: false,
    popularity: 88
  },
  {
    title: "Mobile App Development",
    description: "Build cross-platform mobile applications using React Native.",
    instructor: "Sarah Wilson",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&auto=format",
    category: "Development",
    featured: true,
    popularity: 92
  }
];

const categories = {
  Development: { count: 2 },
  "Data Science": { count: 1 },
  Marketing: { count: 1 }
};

export const seedDatabase = async () => {
  try {
    // Add courses
    const coursesPromises = sampleCourses.map(course => 
      addDoc(collection(db, 'courses'), course)
    );
    await Promise.all(coursesPromises);

    // Add categories
    const batch = writeBatch(db);
    Object.entries(categories).forEach(([name, data]) => {
      const categoryRef = doc(db, 'categories', name);
      batch.set(categoryRef, data);
    });
    await batch.commit();

    console.log('Sample data added successfully');
  } catch (error) {
    console.error('Error adding sample data:', error);
  }
};
