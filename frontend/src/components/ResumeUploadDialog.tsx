import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, Sparkles, Check, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

interface ResumeUploadDialogProps {
    onUploadComplete: () => void;
    trigger?: React.ReactNode;
}

export function ResumeUploadDialog({ onUploadComplete, trigger }: ResumeUploadDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile?.type === "application/pdf") {
            setFile(droppedFile);
            setError(null);
        } else {
            setError("Please upload a PDF file");
        }
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile?.type === "application/pdf") {
            setFile(selectedFile);
            setError(null);
        } else {
            setError("Please upload a PDF file");
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus('uploading');
        setError(null);

        try {
            // Short delay to show uploading state
            await new Promise(r => setTimeout(r, 500));
            setStatus('processing');

            await api.uploadResume(file);

            setStatus('success');
            await new Promise(r => setTimeout(r, 1000));

            onUploadComplete();
            setIsOpen(false);
            resetState();
        } catch (err: any) {
            setStatus('error');
            setError(err.message || "Failed to process resume");
        } finally {
            setUploading(false);
        }
    };

    const resetState = () => {
        setFile(null);
        setStatus('idle');
        setError(null);
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'uploading': return "Uploading resume...";
            case 'processing': return "Gemini AI is analyzing your resume...";
            case 'success': return "Profile updated successfully!";
            case 'error': return error || "Something went wrong";
            default: return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetState(); }}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" className="gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Resume
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        Upload Your Resume
                    </DialogTitle>
                    <DialogDescription>
                        Our AI will extract your skills, experience, and create your career profile.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {/* Drop Zone */}
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                            ${isDragging
                                ? "border-purple-500 bg-purple-50"
                                : file
                                    ? "border-green-500 bg-green-50"
                                    : "border-slate-300 hover:border-purple-400 hover:bg-slate-50"
                            }
                        `}
                        onClick={() => document.getElementById('resume-input')?.click()}
                    >
                        <input
                            id="resume-input"
                            type="file"
                            accept=".pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {file ? (
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                                <p className="font-medium text-green-700">{file.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(file.size / 1024).toFixed(1)} KB • Ready to upload
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-slate-500" />
                                </div>
                                <p className="font-medium">Drop your resume here</p>
                                <p className="text-sm text-muted-foreground">
                                    or click to browse (PDF only)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Status Messages */}
                    {status !== 'idle' && (
                        <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${status === 'error'
                            ? 'bg-red-50 text-red-700'
                            : status === 'success'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-purple-50 text-purple-700'
                            }`}>
                            {status === 'uploading' || status === 'processing' ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : status === 'success' ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                <AlertCircle className="w-4 h-4" />
                            )}
                            {getStatusMessage()}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Analyze with AI
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
