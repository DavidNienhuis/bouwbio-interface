import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";

interface ResultDisplayProps {
  query: string;
  result: string;
  status: "running" | "done" | "failed";
  timestamp: Date;
}

export const ResultDisplay = ({ query, result, status, timestamp }: ResultDisplayProps) => {
  return (
    <Card className="p-6 bg-gradient-card border-border shadow-md hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={status} result={result} />
              <span className="text-xs text-muted-foreground">
                {timestamp.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm font-medium text-foreground/80">
              {query}
            </p>
          </div>
        </div>
        
        {status === "done" && result && (
          <div className="prose prose-sm max-w-none prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-td:border-border prose-th:border-border prose-th:bg-muted">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>
        )}
        
        {status === "failed" && (
          <div className="text-sm text-destructive">
            Er is een fout opgetreden bij het verwerken van je vraag. Probeer het opnieuw.
          </div>
        )}
      </div>
    </Card>
  );
};
