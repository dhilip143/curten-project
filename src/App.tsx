import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./store/AppContext";
import { Layout } from "./components/Layout";
import { LandingPage } from "./components/LandingPage";
import { PhotoCapture } from "./components/PhotoCapture";
import { WindowSelector } from "./components/WindowSelector";
import { CatalogBrowser } from "./components/CatalogBrowser";
import { PreviewAndEdit } from "./components/PreviewAndEdit";
import { useApp } from "./store/AppContext";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { state } = useApp();

  const renderCurrentStep = () => {
    switch (state.step) {
      case 'landing':
        return <LandingPage />;
      case 'photo':
        return <PhotoCapture />;
      case 'window':
        return <WindowSelector />;
      case 'catalog':
        return <CatalogBrowser />;
      case 'preview':
        return <PreviewAndEdit />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <Layout>
      {renderCurrentStep()}
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <AppProvider>
                <AppContent />
              </AppProvider>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
