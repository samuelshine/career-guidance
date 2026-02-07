import { useEffect, useState } from "react"
import { RealityGraph } from "../components/graph/RealityGraph"
import { CommitHistory } from "../components/CommitHistory"
import { MergeBranchDialog } from "../components/MergeBranchDialog"
import { RecruiterDialog } from "../components/RecruiterDialog"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Plus, Loader2 } from "lucide-react"
import { api, type CareerState, type Conflict } from "@/lib/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResumeUploadDialog } from "@/components/ResumeUploadDialog"
import { ConflictSheet } from "@/components/ConflictSheet"


export default function Dashboard() {
    const [state, setState] = useState<CareerState | null>(null)
    const [loading, setLoading] = useState(true)
    const [forking, setForking] = useState(false)

    // Fork Form State
    const [targetRole, setTargetRole] = useState("Product Manager")
    const [jobDescription, setJobDescription] = useState("Looking for a PM with SQL and Product Sense.")
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // Conflict Sheet State
    const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null)
    const [isConflictSheetOpen, setIsConflictSheetOpen] = useState(false)
    const [isMergeDialogOpen, setIsMergeDialogOpen] = useState(false)

    // Recruiter Dialog State
    const [recruiterData, setRecruiterData] = useState<any>(null)
    const [isRecruiterDialogOpen, setIsRecruiterDialogOpen] = useState(false)

    const refreshState = async () => {
        try {
            const data = await api.getState()
            setState(data)
        } catch (e) {
            console.error("Failed to fetch state", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refreshState()
    }, [])

    const handleFork = async () => {
        setForking(true)
        try {
            await api.createBranch(targetRole, jobDescription)
            await refreshState()
            setIsDialogOpen(false)
        } catch (e) {
            console.error("Fork failed", e)
        } finally {
            setForking(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-500" />
                <p className="text-sm text-muted-foreground">Loading your career paths...</p>
            </div>
        </div>
    )

    return (
        <div className="p-6 lg:p-8 space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Christ University Placement Ready</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        CareerOps • Plan • Prepare • Succeed
                    </p>
                </div>
                <div className="flex gap-2">
                    <ResumeUploadDialog onUploadComplete={refreshState} />

                    <Button variant="outline" onClick={() => setIsMergeDialogOpen(true)}>
                        Merge Paths
                    </Button>

                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={async () => {
                            if (!state?.active_branch_id) return;
                            try {
                                const res = await api.checkHeadhuntStatus(state.active_branch_id);
                                setRecruiterData(res);
                                setIsRecruiterDialogOpen(true);
                            } catch (e) {
                                console.error("Recruiter check failed", e);
                            }
                        }}
                    >
                        Check Hiring Status
                    </Button>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-slate-900 hover:bg-slate-800">
                                <Plus className="mr-2 h-4 w-4" />
                                New Path
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Fork Your Career Path</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Target Role</Label>
                                    <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Job Description / Context</Label>
                                    <Textarea value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button onClick={handleFork} disabled={forking} className="bg-slate-900 hover:bg-slate-800">
                                    {forking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                    {forking ? "Analyzing..." : "Create Path"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Main Graph Area */}
                <div className="lg:col-span-2 h-full min-h-[400px]">
                    <Card className="h-full flex flex-col border-slate-200">
                        <CardHeader className="shrink-0 pb-2">
                            <CardTitle className="text-base">Path Visualization</CardTitle>
                            <CardDescription className="text-xs">Drag to explore • Click nodes to see details</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-0 relative">
                            {/* Pass state to graph. simplified for MVP */}
                            <RealityGraph state={state} />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-4 overflow-auto">
                    <Card className="border-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                Your Profile
                                <span className="text-xs font-normal bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-xs text-muted-foreground">Current Role</p>
                                <p className="text-sm font-medium">{state?.current_role || 'Not set'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground mb-2">Skills</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {state?.skills.length ? state.skills.map(s => (
                                        <span key={s.name} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md">{s.name}</span>
                                    )) : (
                                        <span className="text-xs text-muted-foreground">Upload resume to see skills</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Branch Conflicts */}
                    {state?.active_branch_id && state.branches[state.active_branch_id]?.conflicts.length > 0 && (
                        <Card className="bg-slate-900 text-white border-none">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base flex items-center gap-2">
                                    Skill Gaps
                                    <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                                        {state.branches[state.active_branch_id].conflicts.length}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {state.branches[state.active_branch_id].conflicts.map((c: Conflict) => (
                                    <button
                                        key={c.id}
                                        onClick={() => { setSelectedConflict(c); setIsConflictSheetOpen(true); }}
                                        className="w-full text-left text-xs p-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10"
                                    >
                                        <span className={`font-medium ${c.severity === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}`}>
                                            {c.severity}
                                        </span>
                                        <span className="text-slate-300 ml-2">{c.missing_skill}</span>
                                    </button>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    <div className="pt-4 border-t border-slate-200">
                        <CommitHistory history={state?.history || []} onRollback={refreshState} />
                    </div>

                    <button
                        onClick={async () => {
                            await fetch('http://localhost:8000/reset', { method: 'POST' });
                            window.location.reload();
                        }}
                        className="w-full text-xs text-muted-foreground hover:text-foreground py-2 transition-colors mt-2"
                    >
                        Reset Demo Data
                    </button>
                </div>
            </div>

            {/* Conflict Resolution Sheet */}
            <ConflictSheet
                conflict={selectedConflict}
                branchId={state?.active_branch_id || 'main'}
                branchName={state?.branches[state?.active_branch_id || '']?.target_role || 'Target Role'}
                isOpen={isConflictSheetOpen}
                onOpenChange={setIsConflictSheetOpen}
                onResolved={() => {
                    refreshState();
                    setSelectedConflict(null);
                }}
            />

            <MergeBranchDialog
                branches={state?.branches || {}}
                isOpen={isMergeDialogOpen}
                onOpenChange={setIsMergeDialogOpen}
                onMergeComplete={refreshState}
            />

            <RecruiterDialog
                isOpen={isRecruiterDialogOpen}
                onOpenChange={setIsRecruiterDialogOpen}
                data={recruiterData}
            />
        </div>
    )
}
