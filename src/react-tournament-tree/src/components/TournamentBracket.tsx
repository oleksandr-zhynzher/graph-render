import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Graph } from '@graph-render/react';
import type { GraphConfig } from '@graph-render/types';
import type { TournamentBracketProps } from '../types';
import { DEFAULT_TOURNAMENT_CONFIG, DARK_TOURNAMENT_CONFIG } from '../constants';
import { SquashNode } from './SquashNode';
import { BracketToolbar } from './BracketToolbar';
import { BracketThemeProvider } from '../contexts/BracketThemeContext';
import { roundLabelsForGraph } from '../utils/roundLabels';

export const TournamentBracket = React.memo<TournamentBracketProps>(function TournamentBracket({
  graph,
  config,
  vertexComponent = SquashNode,
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

  const handleExportSVG = useCallback(() => {
    if (!wrapperRef.current) return;

    const svgElement = wrapperRef.current.querySelector('svg');
    if (!svgElement) return;

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;

    // Add XML namespace if not present
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

    // Serialize the SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);

    // Create a blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tournament-bracket-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

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
          <Graph graph={graph} vertexComponent={vertexComponent} config={mergedConfig} />
        </div>
      </div>
    </BracketThemeProvider>
  );
});

TournamentBracket.displayName = 'TournamentBracket';
