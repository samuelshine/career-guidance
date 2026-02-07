import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Construction, Sparkles, ArrowLeft } from "lucide-react";

export default function ComingSoonPage() {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 space-y-8 max-w-md">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-purple-500 to-blue-600 p-6 rounded-2xl shadow-xl">
                        <Construction className="w-12 h-12 text-white mx-auto" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Coming Soon
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        We're building something amazing here. Stay tuned for the magic!
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span>Part of Christ University Hackathon 2026</span>
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                </div>

                <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                    <Link to="/" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        </div>
    );
}
