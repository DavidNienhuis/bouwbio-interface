import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BreeamCheckResult {
  product: string;
  productgroep: string;
  certificaat: string;
  result?: string;
  status: "idle" | "loading" | "success" | "error";
  timestamp?: Date;
}

export const BreeamCertificateCheck = () => {
  const [formData, setFormData] = useState({
    product: "",
    productgroep: "",
    certificaat: "",
  });
  const [result, setResult] = useState<BreeamCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product || !formData.productgroep || !formData.certificaat) {
      toast.error("Vul alle velden in");
      return;
    }

    setIsLoading(true);
    setResult({
      ...formData,
      status: "loading",
      timestamp: new Date(),
    });

    try {
      const webhookUrl = "https://n8n-zztf.onrender.com/webhook/2e502b8f-1030-4aaf-92c7-a85ee6e01e9f";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: formData.product,
          productgroep: formData.productgroep,
          certificaat: formData.certificaat,
        }),
      });

      if (!response.ok) {
        throw new Error("Webhook call failed");
      }

      const data = await response.json();

      setResult({
        ...formData,
        result: data.result || data.output || data.formatted_text || JSON.stringify(data),
        status: "success",
        timestamp: new Date(),
      });

      toast.success("BREEAM certificaat check voltooid");
    } catch (error) {
      console.error("BREEAM check error:", error);
      
      setResult({
        ...formData,
        result: "Er is een fout opgetreden bij het verbinden met de validatieservice.",
        status: "error",
        timestamp: new Date(),
      });

      toast.error("Check mislukt");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-card border-border shadow-md">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            BREEAM Certificaat Check
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Valideer producten volgens BREEAM criteria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Input
              id="product"
              type="text"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              placeholder="Bijv. Parketlak ProBudget Satin"
              disabled={isLoading}
              className="bg-card border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="productgroep">Productgroep</Label>
            <Input
              id="productgroep"
              type="text"
              value={formData.productgroep}
              onChange={(e) => setFormData({ ...formData, productgroep: e.target.value })}
              placeholder="Bijv. Flooring materials"
              disabled={isLoading}
              className="bg-card border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificaat">Certificaat</Label>
            <Input
              id="certificaat"
              type="text"
              value={formData.certificaat}
              onChange={(e) => setFormData({ ...formData, certificaat: e.target.value })}
              placeholder="Bijv. EMICODE EC2"
              disabled={isLoading}
              className="bg-card border-border"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Aan het valideren...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Valideer Certificaat
              </>
            )}
          </Button>
        </form>

        {result && result.status !== "idle" && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Status:</span>
              {result.status === "loading" && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Aan het verwerken...
                </span>
              )}
              {result.status === "success" && (
                <span className="text-sm text-success flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Voltooid
                </span>
              )}
              {result.status === "error" && (
                <span className="text-sm text-destructive">Mislukt</span>
              )}
            </div>

            {result.timestamp && (
              <div className="text-xs text-muted-foreground">
                {result.timestamp.toLocaleString('nl-NL')}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-foreground">Product:</span>{" "}
                <span className="text-muted-foreground">{result.product}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Productgroep:</span>{" "}
                <span className="text-muted-foreground">{result.productgroep}</span>
              </div>
              <div>
                <span className="font-medium text-foreground">Certificaat:</span>{" "}
                <span className="text-muted-foreground">{result.certificaat}</span>
              </div>
            </div>

            {result.result && result.status === "success" && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-semibold text-foreground mb-2">Resultaat:</h4>
                <div className="text-sm text-foreground whitespace-pre-wrap">
                  {result.result}
                </div>
              </div>
            )}

            {result.status === "error" && result.result && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{result.result}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
