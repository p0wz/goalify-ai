import { Radio, ChevronRight, Clock, Goal } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const Live = () => {
  const liveMatches = [
    {
      id: 1,
      league: "Premier League",
      home: "Manchester United",
      away: "Liverpool",
      homeScore: 2,
      awayScore: 1,
      minute: 67,
      status: "2. Yarı",
      events: [
        { time: "23'", type: "goal", team: "home", player: "Rashford" },
        { time: "45'", type: "goal", team: "away", player: "Salah" },
        { time: "52'", type: "goal", team: "home", player: "Bruno" },
      ],
      stats: { possession: [58, 42], shots: [12, 8] },
    },
    {
      id: 2,
      league: "La Liga",
      home: "Barcelona",
      away: "Atletico Madrid",
      homeScore: 1,
      awayScore: 1,
      minute: 34,
      status: "1. Yarı",
      events: [
        { time: "12'", type: "goal", team: "home", player: "Lewandowski" },
        { time: "28'", type: "goal", team: "away", player: "Griezmann" },
      ],
      stats: { possession: [62, 38], shots: [7, 4] },
    },
    {
      id: 3,
      league: "Serie A",
      home: "AC Milan",
      away: "Napoli",
      homeScore: 0,
      awayScore: 2,
      minute: 78,
      status: "2. Yarı",
      events: [
        { time: "15'", type: "goal", team: "away", player: "Osimhen" },
        { time: "61'", type: "goal", team: "away", player: "Kvaratskhelia" },
      ],
      stats: { possession: [45, 55], shots: [6, 14] },
    },
    {
      id: 4,
      league: "Bundesliga",
      home: "Dortmund",
      away: "Leipzig",
      homeScore: 3,
      awayScore: 2,
      minute: 89,
      status: "2. Yarı",
      events: [
        { time: "5'", type: "goal", team: "home", player: "Haller" },
        { time: "21'", type: "goal", team: "away", player: "Werner" },
        { time: "44'", type: "goal", team: "home", player: "Bellingham" },
        { time: "56'", type: "goal", team: "away", player: "Werner" },
        { time: "82'", type: "goal", team: "home", player: "Reus" },
      ],
      stats: { possession: [52, 48], shots: [15, 11] },
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Radio className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Canlı Maçlar</h1>
            <p className="text-sm text-muted-foreground">{liveMatches.length} maç oynanıyor</p>
          </div>
        </div>

        {/* Live Indicator Banner */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-semibold text-foreground">CANLI</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm text-muted-foreground">{liveMatches.length} aktif maç</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Güncelleniyor</span>
          </div>
        </div>

        {/* Live Matches */}
        <div className="space-y-4">
          {liveMatches.map((match) => (
            <div 
              key={match.id} 
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
            >
              {/* Match Header */}
              <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{match.league}</span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-destructive/15 text-destructive">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    <span className="text-xs font-bold">{match.minute}'</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{match.status}</span>
                </div>
              </div>

              {/* Score Section */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                        H
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{match.home}</p>
                        <p className="text-xs text-muted-foreground">Ev Sahibi</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 rounded-2xl bg-muted">
                    <span className="text-3xl font-bold text-foreground">
                      {match.homeScore} - {match.awayScore}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 justify-end">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{match.away}</p>
                        <p className="text-xs text-muted-foreground">Deplasman</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                        A
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-2">Topa Sahip Olma</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{match.stats.possession[0]}%</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${match.stats.possession[0]}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-foreground">{match.stats.possession[1]}%</span>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-2">Şutlar</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{match.stats.shots[0]}</span>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${(match.stats.shots[0] / (match.stats.shots[0] + match.stats.shots[1])) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-foreground">{match.stats.shots[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Events */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {match.events.slice(-2).map((event, eventIdx) => (
                      <div key={eventIdx} className="flex items-center gap-1.5 text-xs bg-muted/50 px-2.5 py-1.5 rounded-lg">
                        <Goal className="w-3 h-3 text-green-500" />
                        <span className="text-muted-foreground">{event.time}</span>
                        <span className="font-medium text-foreground">{event.player}</span>
                      </div>
                    ))}
                  </div>
                  <button className="text-primary text-sm font-semibold flex items-center gap-1">
                    Detay <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Live;
