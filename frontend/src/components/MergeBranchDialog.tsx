import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GitMerge } from "lucide-react";
import { api, type Branch } from "@/lib/api";

interface MergeBranchDialogProps {
    branches: Record<string, Branch>;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onMergeComplete: () => void;
}

export function MergeBranchDialog({ branches, isOpen, onOpenChange, onMergeComplete }: MergeBranchDialogProps) {
    const [branchA, setBranchA] = useState<string>("");
    const [branchB, setBranchB] = useState<string>("");
    const [targetRoleName, setTargetRoleName] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleMerge = async () => {
        if (!branchA || !branchB || !targetRoleName) return;

        setLoading(true);
        try {
            await api.mergeBranches(branchA, branchB, targetRoleName);
            onMergeComplete();
            onOpenChange(false);
            // Reset form
            setBranchA("");
            setBranchB("");
            setTargetRoleName("");
        } catch (err) {
            console.error("Merge failed", err);
        } finally {
            setLoading(false);
        }
    };

    const branchOptions = Object.values(branches).filter(b => b.id !== 'main');

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <GitMerge className="w-5 h-5" />
                        Merge Career Paths
                    </DialogTitle>
                    <DialogDescription>
                        Combine two career branches to create a hybrid role.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Source Path A</Label>
                            <Select value={branchA} onValueChange={setBranchA}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branchOptions.map(b => (
                                        <SelectItem key={b.id} value={b.id} disabled={b.id === branchB}>
                                            {b.target_role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Source Path B</Label>
                            <Select value={branchB} onValueChange={setBranchB}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    {branchOptions.map(b => (
                                        <SelectItem key={b.id} value={b.id} disabled={b.id === branchA}>
                                            {b.target_role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>New Hybrid Role Name</Label>
                        <Input
                            placeholder="e.g., AI Product Manager"
                            value={targetRoleName}
                            onChange={(e) => setTargetRoleName(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleMerge} disabled={!branchA || !branchB || !targetRoleName || loading}>
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitMerge className="w-4 h-4 mr-2" />}
                        Merge Paths
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
