import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

const achievements: Achievement[] = [
  {
    id: "1",
    title: "First Steps",
    description: "Complete your first course",
    unlocked: true,
  },
  {
    id: "2",
    title: "Quick Learner",
    description: "Complete 5 courses",
    unlocked: false,
  },
  {
    id: "3",
    title: "Knowledge Seeker",
    description: "Watch 10 hours of content",
    unlocked: false,
  },
];

export function UserProgress() {
  const progress = 65; // This would come from your user state
  const points = 1250; // This would come from your user state

  return (
    <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Progress</h3>
          <Badge variant="secondary" className="font-semibold">
            {points} XP
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground">
          Level {Math.floor(points / 1000) + 1}
        </p>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium">Achievements</h4>
        <div className="grid gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                achievement.unlocked
                  ? "bg-primary/10 text-primary"
                  : "bg-muted/50 text-muted-foreground"
              }`}
            >
              <Trophy className={`w-5 h-5 ${
                achievement.unlocked ? "text-primary" : "text-muted-foreground"
              }`} />
              <div>
                <p className="font-medium">{achievement.title}</p>
                <p className="text-sm opacity-90">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}