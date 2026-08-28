import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Resume from "./pages/Resume";
import NotFound from "./pages/NotFound";
import NeuralVisual from "./pages/NeuralVisual";

const queryClient = new QueryClient();

const BASE_TITLE = "Fakea Vangchhia · AI Engineer";

const ROUTE_TITLES: Record<string, string> = {
  "/": BASE_TITLE,
  "/resume": `Resume · ${BASE_TITLE}`,
  "/neural_visual": `Neural Vision · ${BASE_TITLE}`,
};

/**
 * Keeps `document.title` in step with the route.
 *
 * `index.html` sets the title once, and in a SPA nothing updates it afterwards
 * — so every route shared a single title in browser history, in tab strips, and
 * in bookmarks.
 */
const TitleSync = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    document.title = ROUTE_TITLES[pathname] ?? `Page not found · ${BASE_TITLE}`;
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TitleSync />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/neural_visual" element={<NeuralVisual />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
