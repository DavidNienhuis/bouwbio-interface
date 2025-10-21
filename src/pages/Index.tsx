import { BreeamCertificateCheck } from "@/components/BreeamCertificateCheck";
import { Leaf } from "lucide-react";

const Index = () => {

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
        <BreeamCertificateCheck />
      </main>
    </div>
  );
};

export default Index;
