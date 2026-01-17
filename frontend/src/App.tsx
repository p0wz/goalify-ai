import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Live from "./pages/Live";
import Predictions from "./pages/Predictions";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";
import AdminPanel from "./pages/AdminPanel";
import RequireAuth from "@/components/auth/RequireAuth";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";

const queryClient = new QueryClient();

const App = () => (
    <ThemeProvider defaultTheme="dark" storageKey="sentio-picks-theme">
        <LanguageProvider defaultLanguage="tr" storageKey="sentio-picks-language">
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <Toaster />
                    <BrowserRouter>
                        <Routes>
                            {/* Public Pages */}
                            <Route path="/" element={<Landing />} />
                            <Route path="/pricing" element={<Pricing />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/auth" element={<Auth />} />
                            <Route path="/login" element={<Login />} />

                            {/* Legal Pages */}
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/cookies" element={<Cookies />} />

                            {/* App Pages */}
                            <Route path="/predictions" element={<Predictions />} />
                            <Route path="/live" element={<Live />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/notifications" element={<Notifications />} />
                            <Route path="/premium" element={<Premium />} />

                            {/* Redirects */}
                            <Route path="/dashboard" element={<Navigate to="/predictions" replace />} />
                            <Route path="/leagues" element={<Navigate to="/predictions" replace />} />

                            {/* Protected Routes */}
                            <Route element={<RequireAuth />}>
                                <Route path="/admin" element={<AdminPanel />} />
                            </Route>

                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </TooltipProvider>
            </QueryClientProvider>
        </LanguageProvider>
    </ThemeProvider>
);

export default App;
