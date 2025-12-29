import { AppLayout } from "@/components/layout/AppLayout";
import { Trophy, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const leagues = [
  {
    id: 1,
    name: "Süper Lig",
    country: "Türkiye",
    teams: [
      { pos: 1, name: "Galatasaray", played: 18, won: 14, drawn: 2, lost: 2, gd: 28, points: 44 },
      { pos: 2, name: "Fenerbahçe", played: 18, won: 13, drawn: 3, lost: 2, gd: 24, points: 42 },
      { pos: 3, name: "Beşiktaş", played: 18, won: 10, drawn: 4, lost: 4, gd: 12, points: 34 },
      { pos: 4, name: "Trabzonspor", played: 18, won: 9, drawn: 5, lost: 4, gd: 8, points: 32 },
      { pos: 5, name: "Başakşehir", played: 18, won: 8, drawn: 6, lost: 4, gd: 6, points: 30 },
    ]
  },
  {
    id: 2,
    name: "Premier League",
    country: "İngiltere",
    teams: [
      { pos: 1, name: "Arsenal", played: 18, won: 13, drawn: 4, lost: 1, gd: 29, points: 43 },
      { pos: 2, name: "Liverpool", played: 18, won: 13, drawn: 3, lost: 2, gd: 26, points: 42 },
      { pos: 3, name: "Man City", played: 18, won: 12, drawn: 3, lost: 3, gd: 24, points: 39 },
      { pos: 4, name: "Aston Villa", played: 18, won: 11, drawn: 3, lost: 4, gd: 16, points: 36 },
      { pos: 5, name: "Tottenham", played: 18, won: 10, drawn: 3, lost: 5, gd: 10, points: 33 },
    ]
  },
  {
    id: 3,
    name: "La Liga",
    country: "İspanya",
    teams: [
      { pos: 1, name: "Real Madrid", played: 18, won: 14, drawn: 2, lost: 2, gd: 26, points: 44 },
      { pos: 2, name: "Barcelona", played: 18, won: 12, drawn: 4, lost: 2, gd: 22, points: 40 },
      { pos: 3, name: "Girona", played: 18, won: 11, drawn: 4, lost: 3, gd: 18, points: 37 },
      { pos: 4, name: "Atletico Madrid", played: 18, won: 10, drawn: 5, lost: 3, gd: 14, points: 35 },
      { pos: 5, name: "Athletic Club", played: 18, won: 9, drawn: 6, lost: 3, gd: 12, points: 33 },
    ]
  }
];

const Leagues = () => {
  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display mb-2">Lig Tabloları</h1>
        <p className="text-muted-foreground">Avrupa'nın en iyi liglerinden güncel sıralamalar</p>
      </div>

      {/* Leagues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {leagues.map((league, index) => (
          <div 
            key={league.id}
            className={cn(
              "glass-card-premium rounded-2xl overflow-hidden animate-slide-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* League Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium">{league.name}</h3>
                  <p className="text-xs text-muted-foreground">{league.country}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Table */}
            <div className="p-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs">
                    <th className="text-left pb-3 w-8">#</th>
                    <th className="text-left pb-3">Takım</th>
                    <th className="text-center pb-3 w-8">O</th>
                    <th className="text-center pb-3 w-8">A</th>
                    <th className="text-center pb-3 w-10">P</th>
                  </tr>
                </thead>
                <tbody>
                  {league.teams.map((team) => (
                    <tr 
                      key={team.pos}
                      className="border-t border-border/50 hover:bg-secondary/50 transition-colors"
                    >
                      <td className={cn(
                        "py-3 font-medium",
                        team.pos === 1 && "text-win",
                        team.pos <= 4 && team.pos > 1 && "text-primary"
                      )}>
                        {team.pos}
                      </td>
                      <td className="py-3 font-medium">{team.name}</td>
                      <td className="py-3 text-center text-muted-foreground">{team.played}</td>
                      <td className={cn(
                        "py-3 text-center",
                        team.gd > 0 ? "text-win" : team.gd < 0 ? "text-lose" : ""
                      )}>
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </td>
                      <td className="py-3 text-center font-display">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Leagues;
