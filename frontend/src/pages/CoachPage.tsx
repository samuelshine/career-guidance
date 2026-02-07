import { useState, useRef, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2, Sparkles, User, Bot, ArrowLeft, Zap } from "lucide-react";
import { api, type CareerState, type Conflict } from "@/lib/api";
import { Link } from "react-router-dom";

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedPrompts = [
    "How can I transition into this role?",
    "What skills should I prioritize first?",
    "Can you recommend learning resources?",
    "How long will this transition take?",
    "What's the typical career path for this role?",
];

export default function CoachPage() {
    const [state, setState] = useState<CareerState | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [stateLoading, setStateLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        api.getState().then(s => {
            setState(s);
            setStateLoading(false);
            // Add initial greeting
            const activeBranch = s.branches[s.active_branch_id];

            if (activeBranch) {
                setMessages([{
                    id: '0',
                    role: 'assistant',
                    content: `Hello ${s.full_name}! I'm your AI Career Coach. I see you're exploring a path towards **${activeBranch.target_role || activeBranch.name}**. ${activeBranch.conflicts.length > 0 ? `I've identified ${activeBranch.conflicts.length} skill gaps we should work on.` : ''} How can I help you today?`,
                    timestamp: new Date()
                }]);
            } else {
                // No active branch found
                setMessages([{
                    id: '0',
                    role: 'assistant',
                    content: `Hello ${s.full_name}! I'm your AI Career Coach. \n\nIt looks like you haven't defined a career path yet. To get the best advice, you should create a "Branch" on the Dashboard (e.g., "Product Manager" or "Data Scientist"). \n\nOnce you do that, I can help you identify skill gaps and prepare for interviews!`,
                    timestamp: new Date()
                }]);
            }
        }).catch(() => setStateLoading(false));
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const getActiveConflicts = (): Conflict[] => {
        if (!state) return [];
        const activeBranch = state.branches[state.active_branch_id];
        return activeBranch?.conflicts || [];
    };

    const handleSend = async (messageText?: string) => {
        const text = messageText || input;
        if (!text.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const activeBranch = state?.branches[state.active_branch_id];
            const conflictDesc = getActiveConflicts().map(c => c.missing_skill).join(', ') || 'general career guidance';

            const response = await api.chatCoach(
                state.active_branch_id, // Pass active branch ID
                'none', // Pass 'none' or specific conflict ID if available (we can improve this later to select specific conflict)
                text
            );

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response || response,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    if (stateLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="shrink-0 p-4 border-b bg-white/50 backdrop-blur-sm">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link to="/">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="font-bold text-lg flex items-center gap-2">
                                <div className="p-1 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                                AI Career Coach
                            </h1>
                            <p className="text-sm text-muted-foreground">Powered by Gemini</p>
                        </div>
                    </div>
                    {state?.branches[state.active_branch_id] && (
                        <div className="text-right text-sm">
                            <p className="font-medium">{state.branches[state.active_branch_id].target_role || state.branches[state.active_branch_id].name}</p>
                            <p className="text-muted-foreground">{getActiveConflicts().length} conflicts to resolve</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {message.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                    : 'bg-slate-100'
                                    }`}
                            >
                                <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 dark:prose-invert">
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                            </div>
                            {message.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-slate-100 rounded-2xl px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Thinking...
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Suggested Prompts */}
            {messages.length <= 1 && (
                <div className="shrink-0 px-4 pb-2">
                    <div className="max-w-4xl mx-auto">
                        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Suggested questions
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(prompt)}
                                    className="text-sm px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="shrink-0 p-4 border-t bg-white/50 backdrop-blur-sm">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="max-w-4xl mx-auto flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your career coach..."
                        disabled={loading}
                        className="flex-1"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
