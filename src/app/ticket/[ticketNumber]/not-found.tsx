import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ticket Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The ticket you&apos;re looking for doesn&apos;t exist or may have
            been cancelled.
          </p>

          <Button asChild className="w-full">
            <Link href="/">Back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
