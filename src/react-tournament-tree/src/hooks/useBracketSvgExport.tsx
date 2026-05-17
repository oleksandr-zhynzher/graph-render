import { Graph } from '@graph-render/react';
import type { GraphConfig, TournamentBracketProps, VertexComponent } from '@graph-render/types';
import { SquashNodeRenderMode } from '@graph-render/types';
import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { BracketAppearanceProvider } from '../contexts/BracketAppearanceContext';
import { routeBracketEdges } from '../utils/bracketRouting';
import { downloadSvgFromElement } from '../utils/exportSvg';

interface UseBracketSvgExportParams {
  readonly wrapperRef: React.RefObject<HTMLDivElement | null>;
  readonly nodeRenderMode: NonNullable<TournamentBracketProps['nodeRenderMode']>;
  readonly vertexComponent?: TournamentBracketProps['vertexComponent'];
  readonly isDarkMode: boolean;
  readonly enrichedGraph: TournamentBracketProps['graph'];
  readonly exportVertexComponent: VertexComponent;
  readonly mergedConfig: GraphConfig;
  readonly appearance?: TournamentBracketProps['appearance'];
  readonly compact: boolean;
}

export function useBracketSvgExport({
  wrapperRef,
  nodeRenderMode,
  vertexComponent,
  isDarkMode,
  enrichedGraph,
  exportVertexComponent,
  mergedConfig,
  appearance,
  compact,
}: UseBracketSvgExportParams) {
  return useCallback(() => {
    if (nodeRenderMode !== SquashNodeRenderMode.Html || vertexComponent) {
      downloadSvgFromElement(wrapperRef.current);
      return;
    }

    const host = document.createElement('div');
    host.style.position = 'absolute';
    host.style.width = '0';
    host.style.height = '0';
    host.style.overflow = 'hidden';
    host.style.opacity = '0';
    host.style.pointerEvents = 'none';
    document.body.append(host);

    const exportRoot = createRoot(host);

    try {
      flushSync(() => {
        exportRoot.render(
          <BracketAppearanceProvider
            appearance={appearance}
            isDarkMode={isDarkMode}
            compact={compact}
          >
            <Graph
              graph={enrichedGraph}
              vertexComponent={exportVertexComponent}
              config={mergedConfig}
              routeEdgesOverride={routeBracketEdges}
            />
          </BracketAppearanceProvider>
        );
      });

      downloadSvgFromElement(host);
    } finally {
      exportRoot.unmount();
      host.remove();
    }
  }, [
    enrichedGraph,
    exportVertexComponent,
    appearance,
    compact,
    isDarkMode,
    mergedConfig,
    nodeRenderMode,
    vertexComponent,
    wrapperRef,
  ]);
}
