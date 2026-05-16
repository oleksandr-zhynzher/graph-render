import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Graph } from '@graph-render/react';
import type { GraphConfig, TournamentBracketProps, VertexComponent } from '@graph-render/types';
import { BracketThemeProvider } from '../contexts/BracketThemeContext';
import { routeBracketEdges } from '../utils/bracketRouting';
import { downloadSvgFromElement } from '../utils/exportSvg';

type UseBracketSvgExportParams = {
  wrapperRef: React.RefObject<HTMLDivElement | null>;
  nodeRenderMode: NonNullable<TournamentBracketProps['nodeRenderMode']>;
  vertexComponent?: TournamentBracketProps['vertexComponent'];
  isDarkMode: boolean;
  enrichedGraph: TournamentBracketProps['graph'];
  exportVertexComponent: VertexComponent;
  mergedConfig: GraphConfig;
};

export function useBracketSvgExport({
  wrapperRef,
  nodeRenderMode,
  vertexComponent,
  isDarkMode,
  enrichedGraph,
  exportVertexComponent,
  mergedConfig,
}: UseBracketSvgExportParams) {
  return useCallback(() => {
    if (nodeRenderMode !== 'html' || vertexComponent) {
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
    document.body.appendChild(host);

    const exportRoot = createRoot(host);

    try {
      flushSync(() => {
        exportRoot.render(
          <BracketThemeProvider mode={isDarkMode ? 'dark' : 'light'}>
            <Graph
              graph={enrichedGraph}
              vertexComponent={exportVertexComponent}
              config={mergedConfig}
              routeEdgesOverride={routeBracketEdges}
            />
          </BracketThemeProvider>
        );
      });

      downloadSvgFromElement(host);
    } finally {
      exportRoot.unmount();
      document.body.removeChild(host);
    }
  }, [
    enrichedGraph,
    exportVertexComponent,
    isDarkMode,
    mergedConfig,
    nodeRenderMode,
    vertexComponent,
    wrapperRef,
  ]);
}
