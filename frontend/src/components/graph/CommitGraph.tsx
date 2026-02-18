
import { useMemo, useCallback, useEffect } from 'react';
import ReactFlow, { Background, Controls, type Node, type Edge, useNodesState, useEdgesState, Position, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import type { Commit } from '@/lib/api';

const nodeWidth = 220;
const nodeHeight = 70;

interface CommitGraphProps {
    history: Commit[];
    onNodeClick: (commit: Commit) => void;
    activeBranchId?: string;
    selectedCommitId?: string;
}



export function CommitGraph({ history, onNodeClick, activeBranchId, selectedCommitId }: CommitGraphProps) {
    // Generate nodes and edges from history
    const { initialNodes, initialEdges } = useMemo(() => {
        const nodes: Node[] = [];
        const edges: Edge[] = [];

        // Dagre layout needs consistent node data
        const g = new dagre.graphlib.Graph();
        g.setGraph({ rankdir: 'LR' });
        g.setDefaultEdgeLabel(() => ({}));

        history.forEach((commit) => {
            const isSelected = commit.id === selectedCommitId;

            nodes.push({
                id: commit.id,
                data: {
                    label: (
                        <div className="flex flex-col h-full justify-center">
                            <div className="font-semibold text-xs truncate" title={commit.message}>{commit.message}</div>
                            <div className="text-[10px] text-gray-500 font-mono">{commit.id.substring(0, 7)}</div>
                            <div className="text-[10px] text-gray-400">{new Date(commit.timestamp).toLocaleTimeString()}</div>
                        </div>
                    )
                },
                position: { x: 0, y: 0 },
                style: {
                    width: nodeWidth,
                    height: nodeHeight,
                    border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    background: commit.branch_id === activeBranchId ? '#eff6ff' : '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 0 2px rgba(37, 99, 235, 0.2)' : 'none'
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
            });

            g.setNode(commit.id, { width: nodeWidth, height: nodeHeight });

            if (commit.parent_hash) {
                edges.push({
                    id: `e-${commit.parent_hash}-${commit.id}`,
                    source: commit.parent_hash,
                    target: commit.id,
                    type: 'smoothstep',
                    animated: false,
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: '#94a3b8' }
                });
                g.setEdge(commit.parent_hash, commit.id);
            }

            if (commit.merge_parent_hash) {
                edges.push({
                    id: `e-${commit.merge_parent_hash}-${commit.id}-merge`,
                    source: commit.merge_parent_hash,
                    target: commit.id,
                    type: 'smoothstep',
                    animated: true,
                    markerEnd: { type: MarkerType.ArrowClosed },
                    style: { stroke: '#f59e0b', strokeDasharray: '5,5' }
                });
                g.setEdge(commit.merge_parent_hash, commit.id);
            }
        });

        dagre.layout(g);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = g.node(node.id);
            node.position = {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            };
            return node;
        });

        return { initialNodes: layoutedNodes, initialEdges: edges };
    }, [history, activeBranchId, selectedCommitId]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Update nodes when history changes or selection changes (which triggers re-memo)
    useEffect(() => {
        setNodes(initialNodes);
        setEdges(initialEdges);
    }, [initialNodes, initialEdges, setNodes, setEdges]);

    const onNodeClickCallback = useCallback((_: React.MouseEvent, node: Node) => {
        const commit = history.find(c => c.id === node.id);
        if (commit) onNodeClick(commit);
    }, [history, onNodeClick]);

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClickCallback}
                fitView
            >
                <Background color="#cbd5e1" gap={16} size={1} />
                <Controls />
            </ReactFlow>
        </div>
    );
}
