import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Zap, BookOpen, MessageSquare, Loader2, ChevronRight } from "lucide-react";
import { api, type Conflict } from "@/lib/api";

interface ConflictSheetProps {
    conflict: Conflict | null;
    branchId: string;
    branchName: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onResolved?: () => void;
}

export function ConflictSheet({ conflict, branchId, branchName, isOpen, onOpenChange, onResolved }: ConflictSheetProps) {
    const [loading, setLoading] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [coachAdvice, setCoachAdvice] = useState<string | null>(null);

    if (!conflict) return null;

    const isCritical = conflict.severity === "CRITICAL";

    const handleGetAdvice = async () => {
        setLoading(true);
        try {
            const response = await api.chatCoach(
                branchName,
                conflict.description,
                `How can I address this gap: ${conflict.missing_skill}?`,
                branchId,
                conflict.id
            );
            setCoachAdvice(response.response || response);
        } catch (err) {
            console.error("Failed to get coach advice", err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        setResolving(true);
        try {
            await api.resolveConflict(branchId, conflict.id);
            // Wait a small amount for effect
            setTimeout(() => {
                onResolved?.();
                onOpenChange(false);
                setResolving(false);
            }, 500);
        } catch (err) {
            console.error(err);
            setResolving(false);
        }
    }

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg">
                <SheetHeader>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium w-fit ${isCritical
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                        }`}>
                        <AlertTriangle className="w-4 h-4" />
                        {conflict.severity} Conflict
                    </div>
                    <SheetTitle className="text-xl mt-4">
                        {conflict.missing_skill}
                    </SheetTitle>
                    <SheetDescription className="text-base">
                        {conflict.description}
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                    {/* Suggested Patch */}
                    {conflict.suggested_patch && (
                        <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Zap className="w-4 h-4 text-purple-500" />
                                Suggested Resolution
                            </div>
                            <div className="space-y-2">
                                {conflict.suggested_patch.action_items?.map((item: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2 text-sm">
                                        <ChevronRight className="w-4 h-4 mt-0.5 text-purple-500 shrink-0" />
                                        <span>{item}</span>
                                    </div>
                                )) || (
                                        <p className="text-sm text-muted-foreground">
                                            {typeof conflict.suggested_patch === 'string'
                                                ? conflict.suggested_patch
                                                : conflict.suggested_patch.title || "Work on developing this skill"}
                                        </p>
                                    )}
                            </div>
                            {conflict.suggested_patch.estimated_hours && (
                                <p className="text-xs text-muted-foreground">
                                    Estimated time: {conflict.suggested_patch.estimated_hours} hours
                                </p>
                            )}
                        </div>
                    )}

                    {/* AI Coach Advice */}
                    {coachAdvice && (
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                            <div className="flex items-center gap-2 text-sm font-semibold text-purple-700 mb-2">
                                <MessageSquare className="w-4 h-4" />
                                AI Career Coach
                            </div>
                            <p className="text-sm">{coachAdvice}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid gap-3">
                        <Button
                            onClick={handleGetAdvice}
                            disabled={loading}
                            variant="outline"
                            className="justify-start h-auto py-3"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                            ) : (
                                <MessageSquare className="w-5 h-5 mr-3 text-purple-500" />
                            )}
                            <div className="text-left">
                                <div className="font-medium">Ask Career Coach</div>
                                <div className="text-xs text-muted-foreground">Get personalized advice from AI</div>
                            </div>
                        </Button>

                        <Button
                            variant="outline"
                            className="justify-start h-auto py-3"
                            onClick={() => window.open(`https://www.google.com/search?q=learn+${encodeURIComponent(conflict.missing_skill)}`, '_blank')}
                        >
                            <BookOpen className="w-5 h-5 mr-3 text-blue-500" />
                            <div className="text-left">
                                <div className="font-medium">Find Learning Resources</div>
                                <div className="text-xs text-muted-foreground">Search for courses and tutorials</div>
                            </div>
                        </Button>
                    </div>
                </div>

                <SheetFooter className="mt-8">
                    <Button
                        onClick={handleResolve}
                        disabled={resolving}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                        {resolving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                        Mark as Resolved
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
