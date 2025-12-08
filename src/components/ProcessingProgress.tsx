import { Progress } from "@/components/ui/progress";

interface ProcessingProgressProps {
  progress: number;
}

export function ProcessingProgress({ progress }: ProcessingProgressProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Extracting text...</span>
        <span className="font-medium text-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
