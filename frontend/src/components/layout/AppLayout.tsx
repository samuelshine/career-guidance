import { useState, useEffect } from "react"
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom"
import { LayoutDashboard, Compass, GitBranch, Zap, LogOut, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { api, type CareerState } from "@/lib/api"

const SidebarItem = ({ icon: Icon, label, to, active }: any) => (
    <Link
        to={to}
        className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm font-medium",
            active
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        )}
    >
        <Icon className={cn("w-5 h-5", active ? "text-purple-600" : "text-slate-400")} />
        {label}
    </Link>
)

export function AppLayout() {
    const navigate = useNavigate()
    const location = useLocation()
    const [state, setState] = useState<CareerState | null>(null)

    useEffect(() => {
        api.getState().then(setState).catch(() => { })
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
                            CareerOps
                        </span>
                    </h1>
                    <p className="text-xs text-muted-foreground mt-1">Christ University Edition</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
                    <SidebarItem
                        icon={LayoutDashboard}
                        label="Multiverse View"
                        to="/"
                        active={location.pathname === "/"}
                    />
                    <SidebarItem
                        icon={GitBranch}
                        label="Branch Explorer"
                        to="/branches"
                        active={location.pathname === "/branches"}
                    />
                    <SidebarItem
                        icon={Compass}
                        label="Career Coach"
                        to="/coach"
                        active={location.pathname === "/coach"}
                    />
                    <SidebarItem
                        icon={Video}
                        label="Mock Interview"
                        to="/interview"
                        active={location.pathname === "/interview"}
                    />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold">
                            {state?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="text-sm flex-1 min-w-0">
                            <div className="font-semibold truncate">
                                {state?.full_name || 'User'}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                                {state?.current_role || 'Loading...'}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto bg-slate-50/50">
                <Outlet />
            </main>
        </div>
    )
}
