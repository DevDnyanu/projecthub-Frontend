import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ProjectProvider } from "@/context/ProjectContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import Index          from "./pages/Index";
import ProjectDetail  from "./pages/ProjectDetail";
import PostProject    from "./pages/PostProject";
import MyProjects     from "./pages/MyProjects";
import AdminDashboard from "./pages/AdminDashboard";
import UserLogin      from "./pages/UserLogin";
import VerifyEmail    from "./pages/VerifyEmail";
import ResetPassword  from "./pages/ResetPassword";
import UserProfile    from "./pages/UserProfile";
import NotFound       from "./pages/NotFound";

// Footer pages
import About      from "./pages/About";
import Contact    from "./pages/Contact";
import Help       from "./pages/Help";
import Terms      from "./pages/Terms";
import Privacy    from "./pages/Privacy";
import Blog       from "./pages/Blog";
import HowItWorks from "./pages/HowItWorks";
import Pricing    from "./pages/Pricing";
import Careers    from "./pages/Careers";
import Press      from "./pages/Press";

const queryClient = new QueryClient();

/** Redirect to /login if not authenticated */
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
};

const NO_FOOTER_PATHS = ["/login", "/reset-password", "/verify-email"];

const AppRoutes = () => {
  const { pathname } = useLocation();
  const showFooter = !NO_FOOTER_PATHS.includes(pathname);

  return (
  <div className="flex min-h-screen flex-col bg-background">
    <Navbar />

    <main className="flex-1">
      <Routes>
        {/* ── Public ── */}
        <Route path="/"               element={<Index />} />
        <Route path="/login"          element={<UserLogin />} />
        <Route path="/verify-email"   element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/users/:id"      element={<UserProfile />} />

        {/* ── Authenticated ── */}
        <Route path="/project/:id"  element={<RequireAuth><ProjectDetail /></RequireAuth>} />
        <Route path="/post-project" element={<RequireAuth><PostProject /></RequireAuth>} />
        <Route path="/my-projects"  element={<RequireAuth><MyProjects /></RequireAuth>} />
        <Route path="/admin"        element={<RequireAuth><AdminDashboard /></RequireAuth>} />

        {/* ── Footer pages (public) ── */}
        <Route path="/about"        element={<About />} />
        <Route path="/contact"      element={<Contact />} />
        <Route path="/help"         element={<Help />} />
        <Route path="/terms"        element={<Terms />} />
        <Route path="/privacy"      element={<Privacy />} />
        <Route path="/blog"         element={<Blog />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/pricing"      element={<Pricing />} />
        <Route path="/careers"      element={<Careers />} />
        <Route path="/press"        element={<Press />} />

        {/* ── Redirects ── */}
        <Route path="/admin/login"  element={<Navigate to="/login" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>

    {showFooter && <Footer />}
  </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <ProjectProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
