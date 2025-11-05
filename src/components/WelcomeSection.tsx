function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
}

export const WelcomeSection = () => {
  const userName = "Lana";
  const greeting = getGreeting();
  
  return (
    <div className="text-center space-y-4 mb-8">
      {/* Versie Badge */}
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted/50 border border-border/50">
        <span className="text-xs font-medium text-muted-foreground">
          LiLi 3.0
        </span>
      </div>
      
      {/* Welkomstboodschap */}
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold text-foreground tracking-tight">
          Good {greeting}, {userName}!
        </h1>
        <p className="text-xl text-muted-foreground">
          I am ready to help you
        </p>
      </div>
    </div>
  );
};
