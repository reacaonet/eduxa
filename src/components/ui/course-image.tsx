import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';
import { Skeleton } from './skeleton';

interface CourseImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const CourseImage = ({ src, alt, className = '' }: CourseImageProps) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useState(() => {
    const loadImage = async () => {
      try {
        if (src.startsWith('http')) {
          setImageUrl(src);
        } else {
          const storageRef = ref(storage, src);
          const url = await getDownloadURL(storageRef);
          setImageUrl(url);
        }
      } catch (err) {
        console.error('Error loading image:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadImage();
  }, [src]);

  if (loading) {
    return <Skeleton className={`${className} bg-muted`} />;
  }

  if (error || !imageUrl) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center`}>
        <span className="text-muted-foreground">No image</span>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};
