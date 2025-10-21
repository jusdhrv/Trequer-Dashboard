"use client";

import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleDashboardClick = () => {
    router.push("/dashboard");
  };

  const handleContributeClick = () => {
    window.open(
      "https://github.com/jusdhrv/Trequer-Dashboard?tab=contributing-ov-file#",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
            Project Trequer
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium">
            Agile rover
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={handleDashboardClick}
            size="lg"
            className="w-full sm:w-auto px-8 py-3 text-lg font-medium"
          >
            Dashboard
          </Button>
          <Button
            onClick={handleContributeClick}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto px-8 py-3 text-lg font-medium"
          >
            Contribute
          </Button>
        </div>
      </div>
    </div>
  );
}

