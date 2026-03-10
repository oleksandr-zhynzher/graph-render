import React, { useMemo, useRef, useState, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Graph } from '@graph-render/react';
import type { GraphConfig, VertexComponentProps } from '@graph-render/types';
import type { TournamentBracketProps } from '../types';
import { DEFAULT_TOURNAMENT_CONFIG, DARK_TOURNAMENT_CONFIG } from '../constants';
import { SquashNode } from './SquashNode';
import { BracketToolbar } from './BracketToolbar';
import { BracketThemeProvider } from '../contexts/BracketThemeContext';
import { roundLabelsForGraph } from '../utils/roundLabels';

export const TournamentBracket = React.memo<TournamentBracketProps>(function TournamentBracket({
  graph,
  config,
  vertexComponent,
  nodeRenderMode = 'export',
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const labels = useMemo(
    () => config?.labels ?? roundLabelsForGraph(graph),
    [config?.labels, graph]
  );

  const mergedConfig = useMemo(() => {
    const { theme: themeOverride, ...restConfig } = config ?? {};
    const baseConfig = isDarkMode ? DARK_TOURNAMENT_CONFIG : DEFAULT_TOURNAMENT_CONFIG;
    const baseTheme = baseConfig.theme ?? {};

    return {
      ...baseConfig,
      ...restConfig,
      labels,
      theme: { ...baseTheme, ...(themeOverride ?? {}) },
    } satisfies GraphConfig;
  }, [config, labels, isDarkMode]);

  const handleToggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const exportVertexComponent = useMemo(
    () =>
      vertexComponent ??
      ((props: VertexComponentProps) => <SquashNode {...props} renderMode="export" />),
    [vertexComponent]
  );

  const handleExportSVG = useCallback(() => {
    const renderExportFromElement = (rootElement: Element | null) => {
      const svgElement = rootElement?.querySelector('svg');
      if (!svgElement) {
        return;
      }

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tournament-bracket-${Date.now()}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    if (nodeRenderMode !== 'html' || vertexComponent) {
      renderExportFromElement(wrapperRef.current);
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
              graph={graph}
              vertexComponent={exportVertexComponent}
              config={mergedConfig}
            />
          </BracketThemeProvider>
        );
      });

      renderExportFromElement(host);
    } finally {
      exportRoot.unmount();
      document.body.removeChild(host);
    }
  }, [exportVertexComponent, graph, isDarkMode, mergedConfig, nodeRenderMode, vertexComponent]);

  const resolvedVertexComponent = useMemo(
    () =>
      vertexComponent ??
      ((props: VertexComponentProps) => <SquashNode {...props} renderMode={nodeRenderMode} />),
    [vertexComponent, nodeRenderMode]
  );

  return (
    <BracketThemeProvider mode={isDarkMode ? 'dark' : 'light'}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <BracketToolbar
          isDarkMode={isDarkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onExportSVG={handleExportSVG}
        />
        <div ref={wrapperRef}>
          <Graph graph={graph} vertexComponent={resolvedVertexComponent} config={mergedConfig} />
        </div>
      </div>
    </BracketThemeProvider>
  );
});

TournamentBracket.displayName = 'TournamentBracket';
