import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Live from "./pages/Live";
import Predictions from "./pages/Predictions";
import Leagues from "./pages/Leagues";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import Premium from "./pages/Premium";
import NotFound from "./pages/NotFound";
import Analysis from "./pages/Analysis";
import ApprovedBets from "./pages/ApprovedBets";
import TrainingPool from "./pages/TrainingPool";

const queryClient = new QueryClient();

const App = () => (
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

                    {/* App Pages */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/live" element={<Live />} />
                    <Route path="/predictions" element={<Predictions />} />
                    <Route path="/leagues" element={<Leagues />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/premium" element={<Premium />} />

                    {/* Goalify AI Pages */}
                    <Route path="/analysis" element={<Analysis />} />
                    <Route path="/approved" element={<ApprovedBets />} />
                    <Route path="/training" element={<TrainingPool />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
