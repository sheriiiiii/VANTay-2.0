"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function MobileLandingPage() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/passenger/trip-lists");
  };

  return (
    <div className="h-screen overflow-hidden bg-blue-200 flex flex-col items-center justify-center px-6 py-8">
      <div className="flex-1 flex flex-col items-center justify-center max-w-sm w-full">
        {/* Logo Section */}
        <Image
          src="/assets/rida-logo.png"
          alt="RidA Logo"
          width={550}
          height={550}
          className="mr-2.5 mb-4 object-contain"
          priority
        />
      </div>

      {/* CTA Button */}
      <div className="w-full max-w-sm mb-8">
        <Button
          onClick={handleClick}
          className="group w-full h-13 bg-white hover:bg-cyan-600 hover:text-white text-cyan-600 border border-cyan-600 rounded-full text-lg font-medium"
          size="lg"
        >
          Let&apos;s get started!
          <ArrowRight className="ml-2 h-5 w-5 text-cyan-600 group-hover:text-white transition-colors duration-200" />
        </Button>
      </div>
    </div>
  );
}
