import { useState, useMemo } from "react";
import CourseCard from "@/components/CourseCard";
import { useFirebaseCourses } from "@/hooks/useFirebaseCourses";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const levels = [
  { value: "all", label: "Todos os níveis" },
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];

const categories = [
  "Todos",
  "Desenvolvimento",
  "Design",
  "Marketing",
  "Negócios",
  "Produtividade",
  "Fotografia",
  "Música",
];

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructorName: string;
  category: string;
  duration: number;
  level: string;
  price: number;
  status: string;
}

const CourseSection = ({ 
  title, 
  courses, 
  loading,
  filteredCount,
}: { 
  title: string; 
  courses: Course[]; 
  loading: boolean;
  filteredCount?: number;
}) => {
  // Limita a 10 cursos por linha
  const displayCourses = courses.slice(0, 10);
  
  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-4 px-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        {filteredCount !== undefined && (
          <span className="text-muted-foreground">
            {filteredCount} {filteredCount === 1 ? 'curso encontrado' : 'cursos encontrados'}
          </span>
        )}
      </div>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-4 pb-4 px-4">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="w-[280px] h-[250px] rounded-xl flex-none" />
            ))
          ) : displayCourses.length > 0 ? (
            displayCourses.map((course) => (
              <div key={course.id} className="flex-none">
                <CourseCard {...course} />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-8 text-muted-foreground">
              Nenhum curso encontrado com os filtros selecionados
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

const FilterBar = ({ 
  selectedCategory,
  setSelectedCategory,
  selectedLevel,
  setSelectedLevel,
  priceRange,
  setPriceRange,
  searchTerm,
  setSearchTerm,
  onReset
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedLevel: string;
  setSelectedLevel: (level: string) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onReset: () => void;
}) => (
  <div className="container mx-auto mb-8">
    <div className="bg-card rounded-lg p-4">
      <div className="flex flex-col gap-4">
        {/* Barra de Pesquisa */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Pesquisar cursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Categorias */}
          <ScrollArea className="w-full md:w-auto whitespace-nowrap">
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                  className="flex-none"
                >
                  {category}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          <div className="flex gap-4 items-center flex-1 min-w-0">
            {/* Nível */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Preço */}
            <div className="flex-1 min-w-0 px-4">
              <p className="text-sm text-muted-foreground mb-2">
                Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
              </p>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={priceRange}
                onValueChange={setPriceRange}
                className="w-full"
              />
            </div>

            {/* Reset Button */}
            <Button 
              variant="outline" 
              onClick={onReset}
              className="whitespace-nowrap"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const Courses = () => {
  const { courses, loading } = useFirebaseCourses();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchTerm, setSearchTerm] = useState("");

  // Aplicar filtros e pesquisa
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      // Filtro de pesquisa
      if (searchTerm && !course.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro de categoria
      if (selectedCategory !== "Todos" && course.category !== selectedCategory) {
        return false;
      }

      // Filtro de nível
      if (selectedLevel !== "all" && course.level !== selectedLevel) {
        return false;
      }

      // Filtro de preço
      if (course.price < priceRange[0] || course.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [courses, searchTerm, selectedCategory, selectedLevel, priceRange]);

  // Separar cursos em destaque (mais recentes) e populares (mais antigos)
  const featuredCourses = useMemo(() => courses, [courses]);
  const popularCourses = useMemo(() => [...courses].reverse(), [courses]);

  // Reset dos filtros
  const handleReset = () => {
    setSearchTerm("");
    setSelectedCategory("Todos");
    setSelectedLevel("all");
    setPriceRange([0, 1000]);
  };

  // Verifica se há filtros ativos
  const hasActiveFilters = searchTerm !== "" || 
                         selectedCategory !== "Todos" || 
                         selectedLevel !== "all" || 
                         priceRange[0] !== 0 || 
                         priceRange[1] !== 1000;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Amplie Seus Conhecimentos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Escolha entre centenas de cursos ministrados por instrutores especializados
          </p>
        </div>
      </div>

      {/* Filtros */}
      <FilterBar 
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onReset={handleReset}
      />

      {/* Cursos */}
      <div className="container mx-auto">
        {hasActiveFilters ? (
          // Mostra cursos filtrados
          <CourseSection 
            title="Cursos Encontrados" 
            courses={filteredCourses} 
            loading={loading}
            filteredCount={filteredCourses.length}
          />
        ) : (
          // Mostra todas as seções quando não há filtros
          <>
            <CourseSection 
              title="Cursos em Destaque" 
              courses={featuredCourses} 
              loading={loading}
            />

            <CourseSection 
              title="Cursos Populares" 
              courses={popularCourses} 
              loading={loading}
            />
          </>
        )}
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4">
        <div className="bg-card p-8 md:p-12 rounded-lg text-center">
          <h2 className="text-3xl font-bold mb-4">Pronto para Começar?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Junte-se a milhares de alunos que já estão aprendendo em nossa plataforma
          </p>
          <button className="bg-primary hover:bg-primary-light text-foreground px-8 py-3 rounded-md font-medium transition-colors">
            Começar Agora
          </button>
        </div>
      </div>
    </div>
  );
};

export default Courses;