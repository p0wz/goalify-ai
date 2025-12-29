import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const liveMatches = [
  {
    id: 1,
    homeTeam: "Galatasaray",
    awayTeam: "Fenerbahçe",
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    league: "Süper Lig"
  },
  {
    id: 2,
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    homeScore: 1,
    awayScore: 1,
    minute: 45,
    league: "La Liga"
  },
  {
    id: 3,
    homeTeam: "Man City",
    awayTeam: "Liverpool",
    homeScore: 0,
    awayScore: 0,
    minute: 12,
    league: "Premier League"
  }
];

export const LiveMatchWidget = () => {
  return (
    <div className="glass-card-premium rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 rounded-full bg-live animate-pulse" />
        <h3 className="font-display text-lg">Canlı Maçlar</h3>
        <span className="text-xs text-muted-foreground ml-auto">{liveMatches.length} maç</span>
      </div>
      
      <div className="space-y-4">
        {liveMatches.map((match, index) => (
          <div 
            key={match.id}
            className={cn(
              "p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all cursor-pointer",
              "border border-transparent hover:border-primary/30",
              "animate-slide-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">{match.league}</span>
              <div className="flex items-center gap-1.5 text-xs font-medium text-live">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>{match.minute}'</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={cn(
                  "font-medium text-sm",
                  match.homeScore > match.awayScore && "text-win"
                )}>
                  {match.homeTeam}
                </p>
                <p className={cn(
                  "font-medium text-sm",
                  match.awayScore > match.homeScore && "text-win"
                )}>
                  {match.awayTeam}
                </p>
              </div>
              
              <div className="text-right">
                <p className={cn(
                  "font-display text-lg",
                  match.homeScore > match.awayScore && "text-win"
                )}>
                  {match.homeScore}
                </p>
                <p className={cn(
                  "font-display text-lg",
                  match.awayScore > match.homeScore && "text-win"
                )}>
                  {match.awayScore}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 rounded-xl transition-colors">
        Tüm Canlı Maçları Gör
      </button>
    </div>
  );
};
