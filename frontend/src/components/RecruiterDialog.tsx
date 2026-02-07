import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface RecruiterDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: {
        score: number;
        message: string;
        decision: string;
    } | null;
}

export function RecruiterDialog({ isOpen, onOpenChange, data }: RecruiterDialogProps) {
    if (!data) return null;

    const isHired = data.decision === "HIRE";
    const isWaitlist = data.decision === "WAITLIST";

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {isHired ? <CheckCircle className="text-green-600 w-6 h-6" /> :
                            isWaitlist ? <Clock className="text-yellow-600 w-6 h-6" /> :
                                <XCircle className="text-red-600 w-6 h-6" />}

                        {isHired ? "🎉 Interview Invitation" :
                            isWaitlist ? "⏳ Keep In Touch" :
                                "📋 Application Status"}
                    </DialogTitle>
                    <DialogDescription asChild>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm text-slate-600">Readiness Score:</span>
                            <span className={`text-2xl font-bold ${isHired ? "text-green-600" : isWaitlist ? "text-yellow-600" : "text-red-600"}`}>
                                {data.score}%
                            </span>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto my-4">
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 leading-relaxed text-sm">
                        <p className="whitespace-pre-wrap">{data.message}</p>
                    </div>
                </div>

                <DialogFooter className="flex-shrink-0">
                    <Button
                        onClick={() => onOpenChange(false)}
                        className={isHired ? "bg-green-600 hover:bg-green-700 w-full" : "w-full"}
                    >
                        {isHired ? "Accept Interview" : "Close"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

