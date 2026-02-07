import { useEffect, useState } from 'react';
import { RealityGraph } from '../components/graph/RealityGraph';
import { api, type CareerState, type Conflict } from '../lib/api';
import { ConflictSheet } from '../components/ConflictSheet';

export default function BranchExplorerPage() {
    const [state, setState] = useState<CareerState | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
    const [isConflictSheetOpen, setIsConflictSheetOpen] = useState(false);

    const fetchState = async () => {
        try {
            const data = await api.getState();
            setState(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchState();
    }, []);

    // Helper to find conflict by ID if graph clicks return an ID
    // For now, RealityGraph doesn't interact back up, but we can add that later.
    // We can also reuse the sidebar logic from Dashboard if we want a unified view.

    if (loading) return <div className="p-8">Loading multiverse...</div>;

    return (
        <div className="h-full flex flex-col p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Branch Explorer</h1>
                <p className="text-sm text-muted-foreground">
                    Visualize your career paths and potential futures.
                </p>
            </div>

            <div className="flex-1 min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative">
                <RealityGraph state={state} />

                {/* Overlay instructions or controls could go here */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-lg border border-slate-200 text-xs text-slate-500 shadow-sm max-w-[200px]">
                    <p className="font-medium text-slate-900 mb-1">Graph Legend</p>
                    <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-slate-900"></div> Current Role</div>
                    <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Acquired Skill</div>
                    <div className="flex items-center gap-2 mb-1"><div className="w-2 h-2 rounded-full bg-red-400 border border-red-500 border-dashed"></div> Skill Gap</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-600"></div> Target Role</div>
                </div>
            </div>

            <ConflictSheet
                conflict={selectedConflict}
                branchId={state?.active_branch_id || 'main'}
                branchName={state?.branches[state?.active_branch_id || '']?.target_role || 'Target Role'}
                isOpen={isConflictSheetOpen}
                onOpenChange={setIsConflictSheetOpen}
                onResolved={() => {
                    fetchState();
                    setSelectedConflict(null);
                }}
            />
        </div>
    );
}
