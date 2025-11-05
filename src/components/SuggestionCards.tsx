import { Card } from "@/components/ui/card";
import { MessageSquare, Clock } from "lucide-react";

interface Suggestion {
  title: string;
  timestamp: string;
}

const suggestions: Suggestion[] = [
  { title: "Do androids dream of electric sheep?", timestamp: "Right now" },
  { title: "Androids explained. Why LLMS will rule the world", timestamp: "4 april" },
  { title: "View 87+ more external sources", timestamp: "6 april" },
  { title: "View 87+ more external sources", timestamp: "12 april" },
  { title: "Dreams book", timestamp: "13 april" }
];

export const SuggestionCards = ({ onSuggestionClick }: { onSuggestionClick: (title: string) => void }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full max-w-6xl mx-auto mt-8">
      {suggestions.map((suggestion, index) => (
        <Card
          key={index}
          onClick={() => onSuggestionClick(suggestion.title)}
          className="p-4 bg-card/30 backdrop-blur-sm border-border/50 hover:bg-card/50 hover:border-primary/50 transition-all cursor-pointer group"
        >
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {suggestion.title}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {suggestion.timestamp}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
