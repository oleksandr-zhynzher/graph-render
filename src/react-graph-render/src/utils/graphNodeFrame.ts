import type { GraphNodeFrameStateOptions } from '../models/domain';

export const getGraphNodeFrameState = ({
  isSelected,
  isHighlighted,
  highlightColor,
  selectionColor,
  nodeBorderColor,
  nodeBorderWidth,
  hoverNodeBorderColor,
  hoverNodeBothColor,
  hoverNodeInColor,
  hoverNodeOutColor,
  hoverNodeHighlight,
  isHoveredIn,
  isHoveredOut,
}: GraphNodeFrameStateOptions) => {
  const isHoveredBoth = isHoveredIn && isHoveredOut;
  const isHoveredNode = isHoveredIn || isHoveredOut;
  const hasBorder = (Boolean(nodeBorderColor) && nodeBorderWidth > 0) || isSelected;

  let borderStroke = nodeBorderColor;
  if (isSelected) {
    borderStroke = selectionColor;
  } else if (isHighlighted) {
    borderStroke = highlightColor;
  } else if (!hasBorder) {
    borderStroke = 'none';
  } else if (hoverNodeHighlight) {
    if (isHoveredBoth) {
      borderStroke = hoverNodeBothColor;
    } else if (isHoveredOut) {
      borderStroke = hoverNodeOutColor;
    } else if (isHoveredIn) {
      borderStroke = hoverNodeInColor;
    } else if (isHoveredNode) {
      borderStroke = hoverNodeBorderColor;
    }
  }

  let borderOpacity = 0;
  if (isSelected || isHighlighted) {
    borderOpacity = 1;
  } else if (hasBorder) {
    borderOpacity = hoverNodeHighlight && isHoveredNode ? 1 : 0.4;
  }

  return {
    borderOpacity,
    borderStroke,
    borderWidth:
      isSelected || isHighlighted ? Math.max(2, nodeBorderWidth) : hasBorder ? nodeBorderWidth : 0,
    isHoveredBoth,
    isHoveredNode,
  };
};
