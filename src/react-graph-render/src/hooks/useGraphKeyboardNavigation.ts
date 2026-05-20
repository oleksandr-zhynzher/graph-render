import { useCallback } from 'react';

import { DEFAULT_SELECTION } from '../constants/graph';
import { KeyboardDirection } from '../constants/keyboard';
import type { UseGraphKeyboardNavigationOptions } from '../models/hookContracts';
import { getNearestNodeInDirection } from '../utils/keyboardNavigation';

const getArrowDirection = (key: string): KeyboardDirection => {
  if (key === 'ArrowLeft') return KeyboardDirection.Left;
  if (key === 'ArrowRight') return KeyboardDirection.Right;
  return key === 'ArrowUp' ? KeyboardDirection.Up : KeyboardDirection.Down;
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

      const markHandled = () => {
        event.preventDefault();
        event.stopPropagation();
      };

      if (event.key === '+' || event.key === '=') {
        markHandled();
        updateViewport((current) => ({ zoom: current.zoom + zoomStep }));
        return;
      }
      if (event.key === '-' || event.key === '_') {
        markHandled();
        updateViewport((current) => ({ zoom: current.zoom - zoomStep }));
        return;
      }
      if (event.key === '0') {
        markHandled();
        fitView();
        return;
      }
      if (event.key.startsWith('Arrow')) {
        markHandled();
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
        markHandled();
        const focusedNode = positionedNodeMap.get(focusedNodeId);
        if (focusedNode) handleNodeSelection(focusedNode);
        return;
      }
      if (event.key === 'Escape') {
        markHandled();
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
