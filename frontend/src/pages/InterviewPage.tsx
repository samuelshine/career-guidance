import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Mic, Play, Send, CheckCircle, Award, Clock, ArrowRight, Video } from "lucide-react";
import { api, type CareerState } from "@/lib/api";
import confetti from "canvas-confetti";

export default function InterviewPage() {
    const [state, setState] = useState<CareerState | null>(null);
    const [started, setStarted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Interview Config
    const [targetRole, setTargetRole] = useState("");
    const [company, setCompany] = useState("Google");
    const [topic, setTopic] = useState("System Design");

    // Active Interview State
    const [currentQuestion, setCurrentQuestion] = useState<{ question: string, context: string } | null>(null);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState<{ score: number, feedback: string, improved_answer: string } | null>(null);
    const [timer, setTimer] = useState(0);

    useEffect(() => {
        api.getState().then(setState).catch(console.error);
        const interval = setInterval(() => {
            if (started && !feedback && currentQuestion) {
                setTimer(t => t + 1);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [started, feedback, currentQuestion]);

    useEffect(() => {
        if (state) {
            setTargetRole(state.active_branch_id === 'main' ? 'Software Engineer' : state.branches[state.active_branch_id]?.target_role || 'Software Engineer');
        }
    }, [state]);

    const handleStart = async () => {
        setLoading(true);
        try {
            const q = await api.startInterview(targetRole, company, topic);
            setCurrentQuestion(q);
            setStarted(true);
            setTimer(0);
            setAnswer("");
            setFeedback(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!currentQuestion) return;
        setSubmitting(true);
        try {
            const res = await api.submitInterview(targetRole, currentQuestion.question, answer);
            setFeedback(res);
            if (res.score >= 80) confetti();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!started) {
        return (
            <div className="p-8 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
                        <Video className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
                        AI Mock Interview
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Practice with our AI interviewer powered by Gemini 2.5. Get real-time feedback and improve your answers.
                    </p>
                </div>

                <Card className="max-w-xl mx-auto border-2 shadow-lg">
                    <CardHeader>
                        <CardTitle>Configure Session</CardTitle>
                        <CardDescription>Customize your interview difficulty and focus.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Target Role</label>
                            <Input
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target Company</label>
                                <Select value={company} onValueChange={setCompany}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Google">Google (Data-Driven)</SelectItem>
                                        <SelectItem value="Amazon">Amazon (Leadership Principles)</SelectItem>
                                        <SelectItem value="Startup">Early Stage Startup (Speed)</SelectItem>
                                        <SelectItem value="Enterprise">Traditional Enterprise</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Interview Topic</label>
                                <Select value={topic} onValueChange={setTopic}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="System Design">System Design</SelectItem>
                                        <SelectItem value="Behavioral">Behavioral / Leadership</SelectItem>
                                        <SelectItem value="Coding">DSA / Coding</SelectItem>
                                        <SelectItem value="Frontend">Frontend Domain</SelectItem>
                                        <SelectItem value="Backend">Backend Domain</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            onClick={handleStart}
                            className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            disabled={loading || !targetRole}
                        >
                            {loading ? <Loader2 className="mr-2 animate-spin" /> : <Play className="mr-2 fill-current" />}
                            Start Interview
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-5xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        {company} <span className="text-muted-foreground font-normal">interview for</span> {targetRole}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Badge variant="outline">{topic}</Badge>
                        <span>•</span>
                        <div className="flex items-center text-red-500 font-mono">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTime(timer)}
                        </div>
                    </div>
                </div>
                {!feedback && (
                    <Button variant="ghost" onClick={() => setStarted(false)} className="text-muted-foreground">
                        End Session
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
                {/* Left: Question & Context */}
                <div className="space-y-6 overflow-y-auto pr-2">
                    <Card className="border-l-4 border-l-blue-500 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-lg text-blue-700">Question</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-medium leading-relaxed">
                                {currentQuestion?.question}
                            </p>
                        </CardContent>
                    </Card>

                    {currentQuestion?.context && (
                        <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-600">
                            <strong>Interviewer Note:</strong> {currentQuestion.context}
                        </div>
                    )}

                    {feedback && (
                        <div className="animate-in slide-in-from-bottom-5 duration-500">
                            <Card className={`border-l-4 ${feedback.score >= 70 ? 'border-l-green-500' : 'border-l-orange-500'} shadow-md`}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-lg">Feedback</CardTitle>
                                        <div className={`text-2xl font-bold ${feedback.score >= 70 ? 'text-green-600' : 'text-orange-600'}`}>
                                            {feedback.score}/100
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-slate-700">{feedback.feedback}</p>

                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <div className="flex items-center gap-2 font-semibold text-green-800 mb-2">
                                            <Award className="w-4 h-4" />
                                            Improved Answer
                                        </div>
                                        <div className="text-sm text-green-900/90 prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                                            <ReactMarkdown>{feedback.improved_answer}</ReactMarkdown>
                                        </div>
                                    </div>

                                    <Button onClick={handleStart} className="w-full mt-4">
                                        Next Question <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right: Answer Input */}
                <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                        <span className="font-semibold text-slate-700">Your Answer</span>
                        {!feedback && (
                            <Button variant="ghost" size="sm" className="h-8 gap-2 text-slate-500">
                                <Mic className="w-3 h-3" /> Dictate
                            </Button>
                        )}
                    </div>
                    <textarea
                        className="flex-1 p-6 resize-none focus:outline-none text-lg leading-relaxed"
                        placeholder="Type your answer here..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        disabled={!!feedback || submitting}
                    />
                    <div className="p-4 border-t bg-slate-50">
                        {!feedback && (
                            <Button
                                onClick={handleSubmit}
                                disabled={!answer.trim() || submitting}
                                className="w-full h-12 text-lg bg-black hover:bg-slate-800 text-white transition-all shadow-lg hover:shadow-xl"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Evaluating...
                                    </>
                                ) : (
                                    <>
                                        Submit Answer <Send className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
