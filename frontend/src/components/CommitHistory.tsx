import { Button } from "@/components/ui/button";
import { GitCommit, RotateCcw, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Commit {
    id: string;
    timestamp: string;
    message: string;
    parent_hash: string | null;
}

interface CommitHistoryProps {
    history: Commit[];
    onRollback: () => void;
}

export function CommitHistory({ history, onRollback }: CommitHistoryProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleRollback = async (commitId: string) => {
        if (!confirm("Are you sure you want to rollback to this state? All future progress after this point will be lost.")) return;

        setLoadingId(commitId);
        try {
            await api.rollbackState(commitId);
            onRollback();
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingId(null);
        }
    };

    // Sort history reverse chronological
    const sortedHistory = [...history].reverse();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="w-4 h-4" />
                Career Version History
            </div>

            <div className="h-[300px] w-full rounded-md border p-4 bg-slate-50 overflow-y-auto">
                <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
                    {sortedHistory.map((commit, index) => (
                        <div key={commit.id} className="relative pl-6">
                            {/* Timeline Dot */}
                            <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${index === 0 ? 'bg-green-500 border-green-200' : 'bg-slate-300 border-slate-100'}`} />

                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-900">
                                        {commit.message}
                                    </span>
                                    {index !== 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleRollback(commit.id)}
                                            disabled={!!loadingId}
                                        >
                                            {loadingId === commit.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 mr-1" />}
                                            Rollback
                                        </Button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <GitCommit className="w-3 h-3" />
                                    <span className="font-mono">{commit.id.substring(0, 7)}</span>
                                    <span>•</span>
                                    <span>{new Date(commit.timestamp).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {history.length === 0 && (
                        <div className="text-sm text-center text-muted-foreground py-8">
                            No history available yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
