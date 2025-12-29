import { CheckCircle2, XCircle, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "win",
    title: "Galatasaray vs Fenerbahçe",
    prediction: "Galatasaray Kazanır",
    time: "2 saat önce",
    odds: "1.85"
  },
  {
    id: 2,
    type: "lose",
    title: "Barcelona vs Real Madrid",
    prediction: "Beraberlik",
    time: "4 saat önce",
    odds: "3.40"
  },
  {
    id: 3,
    type: "pending",
    title: "Manchester City vs Liverpool",
    prediction: "2.5 Üst",
    time: "Yarın 22:00",
    odds: "1.72"
  },
  {
    id: 4,
    type: "win",
    title: "Beşiktaş vs Trabzonspor",
    prediction: "Karşılıklı Gol",
    time: "1 gün önce",
    odds: "1.65"
  },
  {
    id: 5,
    type: "pending",
    title: "Bayern vs Dortmund",
    prediction: "Bayern Kazanır",
    time: "2 gün sonra",
    odds: "1.55"
  }
];

const getIcon = (type: string) => {
  switch (type) {
    case "win":
      return <CheckCircle2 className="w-5 h-5 text-win" />;
    case "lose":
      return <XCircle className="w-5 h-5 text-lose" />;
    default:
      return <Clock className="w-5 h-5 text-draw" />;
  }
};

export const ActivityFeed = () => {
  return (
    <div className="glass-card-premium rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg">Son Aktiviteler</h3>
        <button className="text-sm text-primary hover:underline">Tümünü Gör</button>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div 
            key={activity.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors",
              "animate-slide-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              activity.type === "win" && "bg-win/10",
              activity.type === "lose" && "bg-lose/10",
              activity.type === "pending" && "bg-draw/10"
            )}>
              {getIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.prediction}</p>
            </div>
            
            <div className="text-right">
              <p className="font-semibold text-primary">{activity.odds}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
