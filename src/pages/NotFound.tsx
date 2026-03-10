import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-background px-4">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet-500/8 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md">

        {/* Giant 404 */}
        <div className="relative mb-6">
          <p className="font-heading text-[8rem] font-extrabold leading-none tracking-tight text-foreground/5 select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card shadow-xl">
              <Search className="h-9 w-9 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="font-heading text-2xl font-extrabold text-foreground mb-2">
          Page not found
        </h1>
        <p className="text-[15px] text-muted-foreground leading-relaxed mb-8">
          The page <span className="font-medium text-foreground">{location.pathname}</span> doesn't exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            to="/"
            className="btn-glow inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all duration-200 w-full sm:w-auto justify-center"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-2.5 text-[14px] font-medium text-muted-foreground hover:text-foreground hover:border-border/80 transition-all duration-200 w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
