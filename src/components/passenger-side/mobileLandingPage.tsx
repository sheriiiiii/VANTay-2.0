import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function MobileLandingPage() {
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-indigo-400 to-white-400 flex flex-col items-center justify-center px-6 py-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        {/* Logo Section */}
        <div className="mb-8 flex flex-col items-center">
          <img
            src="/assets/vantay-logo-2.png"
            alt="Vantay Logo"
            className="w-[550px] h-[550px] mb-4 object-contain"
          />
        </div>
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-sm mb-8">
        <Button
          className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-lg font-medium"
          size="lg"
        >
          Let's get started!
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
