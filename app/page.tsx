"use client";

import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function HomePage() {
  const router = useRouter();
  const [currentAdjective, setCurrentAdjective] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const adjectives = ["Agile", "All-Terrain", "Cost-Effective", "Easy-to-Use"];

  // Function to measure text width
  const measureTextWidth = (text: string) => {
    if (!measureRef.current) return 0;
    
    // Create a temporary span to measure text width
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.position = 'absolute';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.fontSize = window.getComputedStyle(measureRef.current).fontSize;
    tempSpan.style.fontFamily = window.getComputedStyle(measureRef.current).fontFamily;
    tempSpan.style.fontWeight = window.getComputedStyle(measureRef.current).fontWeight;
    tempSpan.style.fontStyle = window.getComputedStyle(measureRef.current).fontStyle;
    tempSpan.style.textDecoration = window.getComputedStyle(measureRef.current).textDecoration;
    tempSpan.textContent = text;
    
    document.body.appendChild(tempSpan);
    const width = tempSpan.offsetWidth;
    document.body.removeChild(tempSpan);
    
    return width;
  };

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  const handleContributeClick = () => {
    window.open(
      "https://github.com/jusdhrv/Trequer-Dashboard?tab=contributing-ov-file#contributing-to-trequer-dashboard",
      "_blank"
    );
  };

  // Initialize carousel width on mount
  useEffect(() => {
    if (measureRef.current) {
      const initialWidth = measureTextWidth(adjectives[currentAdjective]);
      setCarouselWidth(initialWidth);
    }
  }, []);

  // Update carousel width when adjective changes
  useEffect(() => {
    if (measureRef.current) {
      const newWidth = measureTextWidth(adjectives[currentAdjective]);
      setCarouselWidth(newWidth);
    }
  }, [currentAdjective]);

  // Animated carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdjective((prev) => (prev + 1) % adjectives.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, [adjectives.length]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        onLoadedData={() => setIsLoaded(true)}
      >
        <source src="/placeholder-video_blank.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 z-10"></div>

      {/* Content */}
      <div className="relative z-20 max-w-2xl mx-auto text-center space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight drop-shadow-lg">
            Project Trequer
          </h1>
          <div className="text-xl md:text-2xl text-white/90 font-medium drop-shadow-md italic">
            <div className="flex flex-wrap items-center justify-center gap-1">
              <span>An</span>
              <div 
                ref={carouselRef}
                className="adjective-carousel"
                style={{ width: carouselWidth > 0 ? `${carouselWidth}px` : 'auto' }}
              >
                {adjectives.map((adjective, index) => (
                  <span
                    key={adjective}
                    className={`adjective-item font-bold underline ${
                      index === currentAdjective
                        ? "active"
                        : index < currentAdjective
                        ? "exiting"
                        : "entering"
                    }`}
                  >
                    {adjective}
                  </span>
                ))}
              </div>
              <span>Space Rover</span>
              {/* Hidden span for measuring text width */}
              <span 
                ref={measureRef}
                className="font-bold underline italic text-xl md:text-2xl"
                style={{ 
                  position: 'absolute', 
                  visibility: 'hidden', 
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none'
                }}
              >
                {adjectives[currentAdjective]}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleDashboardClick}
            size="lg"
            className="w-full sm:w-auto px-8 py-3 text-lg font-medium bg-white text-black hover:bg-white/90 backdrop-blur-sm"
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Dashboard
          </Button>
          <Button
            onClick={handleContributeClick}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 py-3 text-lg font-medium border-white text-white hover:bg-white hover:text-black backdrop-blur-sm"
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Contribute
          </Button>
        </div>
      </div>
    </div>
  );
}

