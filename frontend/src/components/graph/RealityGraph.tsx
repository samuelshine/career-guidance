import { useCallback, useEffect, type CSSProperties } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    type Connection,
    type Edge,
    type Node,
    MarkerType,
    Handle,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { CareerState, Conflict } from '@/lib/api';
import { Sparkles, AlertTriangle, CheckCircle, Flag } from 'lucide-react';

interface RealityGraphProps {
    state: CareerState | null;
}

// Custom Node Components can be defined here or imported
// For MVP, we'll use standard nodes with custom styles

export function RealityGraph({ state }: RealityGraphProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    useEffect(() => {
        if (!state) return;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        // 1. Root Node (Current State)
        const rootId = 'root';
        newNodes.push({
            id: rootId,
            position: { x: 50, y: 300 }, // Vertically centered roughly
            data: { label: state.current_role || "Student" },
            type: 'input',
            style: {
                background: '#0f172a', // Slate 900
                color: '#f8fafc',
                border: '2px solid #334155',
                borderRadius: '12px',
                padding: '12px',
                width: 150,
                textAlign: 'center',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }
        });

        // 2. Process Branches
        const branchIds = Object.keys(state.branches);

        // Layout Config
        const BRANCH_SPACING = 300; // Vertical spacing between branches
        const NODE_SPACING_X = 180; // Horizontal spacing between nodes in a branch

        branchIds.forEach((branchId, bIndex) => {
            const branch = state.branches[branchId];
            // Show all branches to visualize the "multiverse"

            const isActive = branchId === state.active_branch_id;
            const baseY = 300 + (bIndex * BRANCH_SPACING) - ((branchIds.length - 1) * BRANCH_SPACING / 2); // Center vertically
            let currentX = 250;

            // Branch Start/Info Node (Optional, or just label the path)
            // Ideally we'd have a fork node, but for now let's just fan out from root

            // 3. Intermediate Nodes (Skills & Conflicts)
            // We'll interleave acquired skills and missing skills (conflicts) to show a "Path"

            // A. Acquired Skills (Green) - Common to all branches effectively, but we visualize them per path to show progression
            // Show a subset to avoid clutter
            const keySkills = state.skills.slice(0, 2);

            let lastNodeId = rootId;

            // Visualize existing skills leading up to the divergence
            keySkills.forEach((skill, sIndex) => {
                const nodeId = `skill-${branchId}-${sIndex}`;
                newNodes.push({
                    id: nodeId,
                    position: { x: currentX, y: baseY + (sIndex % 2 === 0 ? -20 : 20) },
                    data: { label: skill.name },
                    style: {
                        background: isActive ? '#ecfdf5' : '#f1f5f9', // Dim inactive
                        color: isActive ? '#047857' : '#64748b',
                        border: isActive ? '1px solid #10b981' : '1px solid #cbd5e1',
                        borderRadius: '20px',
                        padding: '8px 12px',
                        fontSize: '11px',
                        width: 'auto',
                        opacity: isActive ? 1 : 0.7
                    }
                });

                newEdges.push({
                    id: `e-${lastNodeId}-${nodeId}`,
                    source: lastNodeId,
                    target: nodeId,
                    type: 'smoothstep',
                    animated: isActive,
                    style: { stroke: isActive ? '#10b981' : '#cbd5e1', strokeWidth: isActive ? 2 : 1 },
                });

                lastNodeId = nodeId;
                currentX += NODE_SPACING_X;
            });

            // B. Conflicts (Red) - These are the "To-Do" nodes specific to this branch
            branch.conflicts.forEach((conflict: Conflict, cIndex: number) => {
                const nodeId = `conflict-${branchId}-${conflict.id}`; // Unique ID per branch even if shared conflict concept
                newNodes.push({
                    id: nodeId,
                    position: { x: currentX, y: baseY },
                    data: { label: `Missing: ${conflict.missing_skill}` },
                    style: {
                        background: isActive ? '#fef2f2' : '#f8fafc',
                        color: isActive ? '#b91c1c' : '#94a3b8',
                        border: isActive ? '2px dashed #ef4444' : '1px dashed #cbd5e1',
                        borderRadius: '8px',
                        padding: '10px',
                        width: 150,
                        fontSize: '12px',
                        cursor: isActive ? 'pointer' : 'default',
                        opacity: isActive ? 1 : 0.6
                    }
                });

                newEdges.push({
                    id: `e-${lastNodeId}-${nodeId}`,
                    source: lastNodeId,
                    target: nodeId,
                    type: 'default',
                    animated: isActive,
                    style: { stroke: isActive ? '#ef4444' : '#cbd5e1', strokeWidth: isActive ? 2 : 1, strokeDasharray: '5,5' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: isActive ? '#ef4444' : '#cbd5e1' },
                });

                lastNodeId = nodeId;
                currentX += NODE_SPACING_X;
            });

            // 4. Target Node (Goal)
            const targetId = `target-${branchId}`;
            newNodes.push({
                id: targetId,
                position: { x: currentX + 50, y: baseY },
                data: { label: branch.target_role || "Goal" },
                type: 'output',
                style: {
                    background: isActive ? 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' : '#e2e8f0',
                    color: isActive ? 'white' : '#64748b',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '16px',
                    width: 180,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    boxShadow: isActive ? '0 10px 15px -3px rgb(79 70 229 / 0.3)' : 'none',
                    opacity: isActive ? 1 : 0.6
                }
            });

            // Edge to target
            newEdges.push({
                id: `e-${lastNodeId}-${targetId}`,
                source: lastNodeId,
                target: targetId,
                type: 'default',
                animated: isActive,
                style: { stroke: isActive ? '#94a3b8' : '#cbd5e1', strokeWidth: isActive ? 2 : 1 },
                markerEnd: { type: MarkerType.ArrowClosed, color: isActive ? '#94a3b8' : '#cbd5e1' }
            });
        });

        setNodes(newNodes);
        setEdges(newEdges);
    }, [state, setNodes, setEdges]);

    const onConnect = useCallback(
        (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '400px' }} className="rounded-lg bg-slate-50 border border-slate-200">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                proOptions={{ hideAttribution: true }}
            >
                <Controls className="!bg-white !border-slate-200 [&>button]:!bg-white [&>button]:!border-slate-100 [&>button]:!fill-slate-500" />
                <Background gap={20} size={1} color="#e2e8f0" />
            </ReactFlow>
        </div>
    );
}
