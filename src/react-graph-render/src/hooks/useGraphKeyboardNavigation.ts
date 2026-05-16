import { useCallback } from 'react';
import { DEFAULT_SELECTION } from '../constants/graph';
import { getNearestNodeInDirection } from '../utils/keyboardNavigation';
import type { UseGraphKeyboardNavigationOptions } from '../models/hooks';

const getArrowDirection = (key: string): 'left' | 'right' | 'up' | 'down' => {
  if (key === 'ArrowLeft') return 'left';
  if (key === 'ArrowRight') return 'right';
  return key === 'ArrowUp' ? 'up' : 'down';
};

export const useGraphKeyboardNavigation = ({
  centerOnNode,
  fitView,
  focusedNodeId,
  handleNodeSelection,
  keyboardNavigation,
  positionedNodeMap,
  positionedNodes,
  setFocusedPath,
  updateFocusedNode,
  updateSelection,
  updateViewport,
  zoomStep,
}: UseGraphKeyboardNavigationOptions) => {
  return useCallback(
    (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (!keyboardNavigation) return;

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        updateViewport((current) => ({ zoom: current.zoom + zoomStep }));
        return;
      }
      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        updateViewport((current) => ({ zoom: current.zoom - zoomStep }));
        return;
      }
      if (event.key === '0') {
        event.preventDefault();
        fitView();
        return;
      }
      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        const currentNode = focusedNodeId ? positionedNodeMap.get(focusedNodeId) : undefined;
        if (currentNode) {
          const nextNode = getNearestNodeInDirection(
            currentNode,
            positionedNodes,
            getArrowDirection(event.key)
          );
          if (nextNode) {
            updateFocusedNode(nextNode.id);
            centerOnNode(nextNode.id);
          }
          return;
        }

        updateViewport((current) => {
          if (event.key === 'ArrowLeft') return { x: current.x + 32 };
          if (event.key === 'ArrowRight') return { x: current.x - 32 };
          return event.key === 'ArrowUp' ? { y: current.y + 32 } : { y: current.y - 32 };
        });
        return;
      }
      if ((event.key === 'Enter' || event.key === ' ') && focusedNodeId) {
        event.preventDefault();
        const focusedNode = positionedNodeMap.get(focusedNodeId);
        if (focusedNode) handleNodeSelection(focusedNode);
        return;
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        setFocusedPath(null);
        updateSelection(DEFAULT_SELECTION);
        updateFocusedNode(null);
      }
    },
    [
      centerOnNode,
      fitView,
      focusedNodeId,
      handleNodeSelection,
      keyboardNavigation,
      positionedNodeMap,
      positionedNodes,
      setFocusedPath,
      updateFocusedNode,
      updateSelection,
      updateViewport,
      zoomStep,
    ]
  );
};
