import { Button } from "@/components/ui/button";
import { MessageSquare, Archive, Settings, Sparkles } from "lucide-react";

export const ChatHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 backdrop-blur-md bg-background/80">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold tracking-tight text-foreground">
          LiLi
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
        
        {/* Upgrade Button */}
        <Button className="rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Sparkles className="h-4 w-4 mr-2" />
          Upgrade
        </Button>
      </div>
    </header>
  );
};
