import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, AlertTriangle, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-destructive/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid opacity-30" />
      </div>

      <div className="text-center relative z-10 max-w-md">
        {/* Brutalist 404 */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] font-display-bold leading-none text-gradient select-none">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-20 h-20 brutalist-border bg-destructive/10 flex items-center justify-center shadow-brutalist animate-float">
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </div>
          </div>
        </div>

        <h2 className="brutalist-heading text-2xl md:text-3xl mb-4">
          Sayfa <span className="text-destructive">Bulunamadı</span>
        </h2>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          Ana sayfaya dönerek devam edebilirsiniz.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <button className="btn-brutalist h-12 px-8">
              <Home className="w-5 h-5 mr-2 inline-block" />
              Ana Sayfa
            </button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-brutalist-outline h-12 px-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2 inline-block" />
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
