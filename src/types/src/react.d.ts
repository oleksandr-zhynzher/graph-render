import { ComponentType } from 'react';
import { PositionedNode as CorePositionedNode } from './node';
import { PositionedEdge as CorePositionedEdge, PositionedEdge } from './edge';
import { GraphConfig } from './config';
export interface VertexComponentProps {
    node: CorePositionedNode & {
        label?: any;
    };
    isSelected?: boolean;
    isHovered?: boolean;
    isHoveredIn?: boolean;
    isHoveredOut?: boolean;
    isHoveredBoth?: boolean;
    hoverInColor?: string;
    hoverOutColor?: string;
    hoverBothColor?: string;
    onPathHover?: (sourceIndex: number | null, opts?: {
        playerKey?: string;
    }) => void;
    onPathLeave?: () => void;
}
export interface EdgePathProps {
    edge: PositionedEdge;
    color: string;
    width: number;
    curveEdges: boolean;
    curveStrength: number;
    isHovered?: boolean;
    hoverColor: string;
    hoverMarker?: string;
    hoverEnabled: boolean;
    hoverStrokeWidth?: number;
    hitStrokeWidth?: number;
    onHoverChange?: (hovered: boolean) => void;
    onClick?: () => void;
}
export type VertexComponent = ComponentType<VertexComponentProps>;
export type DragState = {
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
};
export interface GraphProps<TNodeAttrs = any, TEdgeAttrs = any> {
    graph: {
        nodes?: Record<string, TNodeAttrs>;
        adj: Record<string, Record<string, TEdgeAttrs | TEdgeAttrs[]>>;
    };
    vertexComponent: VertexComponent;
    config?: GraphConfig;
    onNodeClick?: (node: CorePositionedNode & {
        label?: any;
    }) => void;
    onEdgeClick?: (edge: CorePositionedEdge & {
        label?: any;
    }) => void;
}
//# sourceMappingURL=react.d.ts.map