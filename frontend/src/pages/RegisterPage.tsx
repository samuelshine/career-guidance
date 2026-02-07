import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Zap, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.register(username, password, fullName);
            await api.login(username, password);
            window.location.href = '/';
        } catch (err) {
            setError('Registration failed. Username might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-12 flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 backdrop-blur-sm rounded-xl">
                            <Zap className="w-8 h-8 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">CareerOps</span>
                    </div>
                    <p className="text-white/60 mt-2">Christ University Edition</p>
                </div>

                <div className="space-y-6">
                    <h1 className="text-4xl font-bold text-white leading-tight">
                        Start Your<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Journey Today
                        </span>
                    </h1>
                    <p className="text-white/70 text-lg max-w-md">
                        Create your profile. Upload your resume.
                        Let AI map your career possibilities.
                    </p>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 text-white/80">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">✓</div>
                            <span>AI-powered skill gap analysis</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">✓</div>
                            <span>Visualize multiple career paths</span>
                        </div>
                        <div className="flex items-center gap-3 text-white/80">
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">✓</div>
                            <span>Personalized career coaching</span>
                        </div>
                    </div>
                </div>

                <p className="text-white/40 text-sm">
                    © 2026 Christ University Hackathon
                </p>
            </div>

            {/* Right Panel - Register Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-sm space-y-8">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                            <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold">CareerOps</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
                        <p className="text-muted-foreground">
                            Join thousands of students mapping their futures
                        </p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="John Doe"
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Choose a username"
                                className="h-11"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Create a strong password"
                                className="h-11"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-11 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </Button>
                    </form>

                    <div className="text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link to="/login" className="font-medium text-purple-600 hover:text-purple-700">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
