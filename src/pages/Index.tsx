import { useState } from "react";
import { ValidationInput } from "@/components/ValidationInput";
import { ResultDisplay } from "@/components/ResultDisplay";
import { toast } from "sonner";
import { Leaf } from "lucide-react";

interface ValidationResult {
  id: string;
  query: string;
  result: string;
  status: "running" | "done" | "failed";
  timestamp: Date;
}

const Index = () => {
  const [results, setResults] = useState<ValidationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleValidation = async (query: string) => {
    const newResult: ValidationResult = {
      id: Date.now().toString(),
      query,
      result: "",
      status: "running",
      timestamp: new Date(),
    };

    setResults((prev) => [newResult, ...prev]);
    setIsLoading(true);

    try {
      // TODO: Replace with actual n8n webhook URL
      const webhookUrl = "https://your-n8n-webhook-url.com/webhook";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Webhook call failed");
      }

      const data = await response.json();

      setResults((prev) =>
        prev.map((r) =>
          r.id === newResult.id
            ? {
                ...r,
                result: data.result || data.output || data.formatted_text || "Geen resultaat ontvangen",
                status: data.status === "done" ? "done" : "failed",
              }
            : r
        )
      );

      if (data.status === "done") {
        toast.success("Validatie voltooid");
      }
    } catch (error) {
      console.error("Validation error:", error);
      
      setResults((prev) =>
        prev.map((r) =>
          r.id === newResult.id
            ? {
                ...r,
                result: "Er is een fout opgetreden bij het verbinden met de validatieservice.",
                status: "failed",
              }
            : r
        )
      );

      toast.error("Validatie mislukt");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Leaf className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bouwbioloog</h1>
              <p className="text-sm text-muted-foreground">AI Validatietool voor Duurzaam Bouwen</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <section className="mb-8">
          <ValidationInput onSubmit={handleValidation} isLoading={isLoading} />
        </section>

        <section className="space-y-4">
          {results.length > 0 ? (
            <>
              <h2 className="text-lg font-semibold text-foreground">Resultaten</h2>
              {results.map((result) => (
                <ResultDisplay
                  key={result.id}
                  query={result.query}
                  result={result.result}
                  status={result.status}
                  timestamp={result.timestamp}
                />
              ))}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Leaf className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                Klaar om te valideren
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Voer een opdracht in om materialen te valideren volgens GN22, BREEAM HEA 02 of Red List criteria.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
