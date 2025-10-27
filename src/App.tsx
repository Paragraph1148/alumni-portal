import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { AlumniDirectory } from "./components/AlumniDirectory";
import { Events } from "./components/Events";
import { JobBoard } from "./components/JobBoard";
import { NewsSection } from "./components/NewsSection";
import { Footer } from "./components/Footer";
import { SearchProvider } from "./components/SearchContext";
import { AuthProvider } from "./components/AuthContext";
import { Toaster } from "./components/ui/sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProfile } from "./components/UserProfile";
import { ScrollToTop } from "./components/ScrollToTop";
import { Analytics } from "@vercel/analytics/next";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <div className="min-h-screen bg-white">
            <ScrollToTop />
            <Header />
            <main>
              <Routes>
                {/* Home page with all sections */}
                <Route
                  path="/"
                  element={
                    <>
                      <Hero />
                      <AlumniDirectory />
                      <Events />
                      <JobBoard />
                      <NewsSection />
                    </>
                  }
                />

                {/* Individual component routes */}
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/directory" element={<AlumniDirectory />} />
                <Route path="/events" element={<Events />} />
                <Route path="/jobs" element={<JobBoard />} />
                <Route path="/news" element={<NewsSection />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}
