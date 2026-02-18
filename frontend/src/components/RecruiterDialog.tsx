
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Shield, Users, UserCheck } from "lucide-react";
import { HiringReport } from "@/lib/api";

interface RecruiterDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    data: HiringReport | null;
}

export function RecruiterDialog({ isOpen, onOpenChange, data }: RecruiterDialogProps) {
    if (!data) return null;

    const isHired = data.final_decision;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Hiring Committee Session
                    </DialogTitle>
                    <DialogDescription>
                        The board is debating your candidacy...
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-slate-50 rounded-md border text-sm my-2">
                    {data.debate_log.map((msg, i) => (
                        <div key={i} className="flex gap-3 animate-in fade-in duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                            <div className="shrink-0 mt-1">
                                {msg.persona.includes("Technical") && <Shield className="w-5 h-5 text-blue-600" />}
                                {msg.persona.includes("HR") && <Users className="w-5 h-5 text-purple-600" />}
                                {msg.persona.includes("Hiring") && <UserCheck className="w-5 h-5 text-green-600" />}
                                {!msg.persona.includes("Technical") && !msg.persona.includes("HR") && !msg.persona.includes("Hiring") && <Users className="w-5 h-5 text-gray-500" />}
                            </div>
                            <div className="flex-1 bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                                <p className="font-semibold text-xs text-slate-500 mb-1">{msg.persona}</p>
                                <p className="text-slate-800 leading-relaxed">{msg.message}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`p-4 rounded-lg border flex items-center gap-4 ${isHired ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="shrink-0">
                        {isHired ? <CheckCircle className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg ${isHired ? 'text-green-800' : 'text-red-800'}`}>
                            {isHired ? "OFFER EXTENDED" : "APPLICATION REJECTED"}
                        </h3>
                        {data.salary_offer && (
                            <p className="text-sm font-semibold text-slate-800 mt-1">Compensation: {data.salary_offer}</p>
                        )}
                        <p className="text-sm text-slate-600 mt-1 italic">{data.feedback}</p>
                    </div>
                </div>

                <DialogFooter className="mt-2">
                    <Button onClick={() => onOpenChange(false)} variant="outline">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
