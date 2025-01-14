import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorName: string;
  category: string;
  duration: number;
  level: string;
  price: number;
  status?: string;
}

const CourseCard = ({ 
  id, 
  title, 
  thumbnail,
  instructorName,
  category,
  duration,
  level,
  price
}: CourseCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDuration = (hours: number) => {
    return `${hours}h`;
  };

  const formatLevel = (level: string) => {
    const levels = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado'
    };
    return levels[level as keyof typeof levels] || level;
  };

  return (
    <Link to={`/course/${id}`}>
      <Card className="group relative w-[280px] hover:scale-105 transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-video">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover rounded-t-lg brightness-100 group-hover:brightness-75 transition-all duration-300" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-course.jpg';
            }}
          />
          <Badge className="absolute top-2 right-2 bg-primary/90">{category}</Badge>
          <Badge className="absolute top-2 left-2 bg-secondary/90">{formatLevel(level)}</Badge>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">Por {instructorName}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="font-bold text-primary">{formatPrice(price)}</span>
            <div className="flex items-center text-muted-foreground text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {formatDuration(duration)}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default CourseCard;