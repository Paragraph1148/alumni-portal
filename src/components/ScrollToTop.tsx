// src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Try multiple methods to ensure scrolling works
    const scrollToTop = () => {
      // Method 1: Standard window scroll
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });

      // Method 2: Document element scroll
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }

      // Method 3: Body scroll (for older browsers)
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // Method 4: Using scrollIntoView on the first element
      const firstElement = document.querySelector("main, body, html");
      if (firstElement) {
        firstElement.scrollIntoView({ behavior: "smooth" });
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(scrollToTop, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
