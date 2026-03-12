import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import RoomLayout from "./pages/RoomLayout.tsx";
import RoomFilesPage from "./pages/RoomFilesPage.tsx";
import RoomTextPage from "./pages/RoomTextPage.tsx";
import RoomShortLinkRedirect from "./pages/RoomShortLinkRedirect.tsx";
import NotFound from "./pages/NotFound.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/r/:hashtag" element={<RoomShortLinkRedirect />} />
          <Route path="/room/:hashtag" element={<RoomLayout />}>
            <Route index element={<Navigate to="files" replace />} />
            <Route path="files" element={<RoomFilesPage />} />
            <Route path="text" element={<RoomTextPage />} />
          </Route>
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
