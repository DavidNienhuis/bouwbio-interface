import { useState } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { WelcomeSection } from "@/components/WelcomeSection";
import { ChatInput } from "@/components/ChatInput";
import { ChatFooter } from "@/components/ChatFooter";

const Index = () => {
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  const handleSubmit = (message: string) => {
    console.log("Submitted:", message);
    setChatMessages([...chatMessages, message]);
    // TODO: Hier later de BREEAM webhook integratie toevoegen
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95 relative">
      {/* Header */}
      <ChatHeader />
      
      {/* Main Content - Centered Vertically */}
      <main className="container mx-auto px-6 pt-32 pb-24 min-h-screen flex flex-col items-center justify-center">
        <div className="w-full max-w-6xl space-y-8">
          {/* Welcome Section */}
          <WelcomeSection />
          
          {/* Chat Input */}
          <ChatInput onSubmit={handleSubmit} />
        </div>
      </main>
      
      {/* Footer */}
      <ChatFooter />
    </div>
  );
};

export default Index;
