"use client";

import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ExternalLink, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function HomePage() {
  const router = useRouter();
  const [currentAdjective, setCurrentAdjective] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const measureRef = useRef<HTMLSpanElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<(HTMLDivElement | null)[]>([]);

  const adjectives = ["Agile", "All-Terrain", "Cost-Effective", "Easy-to-Use"];
  
  // Define sections based on pitch deck slides
  const sections = [
    {
      id: "hero",
      title: "Project Trequer",
      subtitle: "An Agile Space Rover",
      content: "Welcome to Project Trequer - an innovative space exploration solution."
    },
    {
      id: "problem",
      title: "The Problem",
      subtitle: "Space Exploration Challenges",
      content: "Current space exploration missions face significant challenges in terms of cost, reliability, and adaptability."
    },
    {
      id: "solution",
      title: "Our Solution",
      subtitle: "Trequer Space Rover",
      content: "Trequer provides an agile, all-terrain, cost-effective, and easy-to-use space rover solution."
    },
    {
      id: "features",
      title: "Key Features",
      subtitle: "Advanced Capabilities",
      content: "Discover the cutting-edge features that make Trequer the future of space exploration."
    },
    {
      id: "technology",
      title: "Technology",
      subtitle: "Innovation at its Core",
      content: "Built with state-of-the-art technology and engineering excellence."
    }
  ];

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

  // Navigation functions
  const scrollToNextSection = () => {
    const nextSection = currentSection + 1;
    if (nextSection < sections.length) {
      sectionsRef.current[nextSection]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setCurrentSection(nextSection);
    }
  };

  const scrollToSection = (index: number) => {
    if (sectionsRef.current[index]) {
      sectionsRef.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      setCurrentSection(index);
    }
  };

  // Handle scroll events to detect current section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      sectionsRef.current.forEach((section, index) => {
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;
          
          if (scrollPosition >= sectionTop - windowHeight / 2 && 
              scrollPosition < sectionBottom - windowHeight / 2) {
            setCurrentSection(index);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="relative">
      {/* Hero Section */}
      <section 
        ref={(el) => sectionsRef.current[0] = el}
        className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      >
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
              {sections[0].title}
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

        {/* Downward Arrow */}
        {currentSection < sections.length - 1 && (
          <button
            onClick={scrollToNextSection}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 text-white hover:text-white/80 transition-colors duration-300 animate-bounce"
            aria-label="Scroll to next section"
          >
            <ChevronDown className="h-8 w-8" />
          </button>
        )}
      </section>

      {/* Additional Sections */}
      {sections.slice(1).map((section, index) => {
        const sectionIndex = index + 1;
        const isLastSection = sectionIndex === sections.length - 1;
        
        return (
          <section
            key={section.id}
            ref={(el) => sectionsRef.current[sectionIndex] = el}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-gray-900 to-gray-800"
          >
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
                  {section.title}
                </h2>
                <h3 className="text-xl md:text-2xl text-white/80 font-medium">
                  {section.subtitle}
                </h3>
                <p className="text-lg text-white/70 max-w-2xl mx-auto">
                  {section.content}
                </p>
              </div>

              {/* Placeholder for images/media */}
              <div className="w-full h-64 bg-gray-700/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600">
                <p className="text-gray-400 text-lg">
                  [Placeholder for {section.title} image/media]
                </p>
              </div>

              {/* Additional content placeholders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-xl font-semibold text-white mb-4">Feature 1</h4>
                  <p className="text-gray-300">[Placeholder content for {section.title}]</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                  <h4 className="text-xl font-semibold text-white mb-4">Feature 2</h4>
                  <p className="text-gray-300">[Placeholder content for {section.title}]</p>
                </div>
              </div>
            </div>

            {/* Downward Arrow */}
            {!isLastSection && (
              <button
                onClick={scrollToNextSection}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white hover:text-white/80 transition-colors duration-300 animate-bounce"
                aria-label="Scroll to next section"
              >
                <ChevronDown className="h-8 w-8" />
              </button>
            )}
          </section>
        );
      })}
    </div>
  );
}

