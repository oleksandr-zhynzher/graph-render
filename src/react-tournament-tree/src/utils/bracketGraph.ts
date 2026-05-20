import type { GraphConfig } from '@graph-render/types';
import type { StageView } from '@graph-render/types/tournament';

import {
  COMPACT_TOURNAMENT_CONFIG,
  DARK_COMPACT_TOURNAMENT_CONFIG,
  DARK_TOURNAMENT_CONFIG,
  DEFAULT_TOURNAMENT_CONFIG,
} from '../constants';
import type { TournamentBracketProps } from '../models/tournamentBracket';
import { injectTournamentPathKeys } from './pathKeys';
import type { ResolvedMatchCardStyle } from './resolveBracketAppearance';

export function buildGraphConfig(
  config: TournamentBracketProps['config'],
  isDarkMode: boolean,
  compact: boolean,
  matchCard: ResolvedMatchCardStyle
): GraphConfig {
  const { theme: themeOverride, ...restConfig } = config ?? {};
  const baseConfig = isDarkMode
    ? compact
      ? DARK_COMPACT_TOURNAMENT_CONFIG
      : DARK_TOURNAMENT_CONFIG
    : compact
      ? COMPACT_TOURNAMENT_CONFIG
      : DEFAULT_TOURNAMENT_CONFIG;

  return {
    ...baseConfig,
    ...restConfig,
    labels: undefined,
    autoLabels: false,
    theme: { ...baseConfig.theme, ...themeOverride },
    fixedNodeSize: restConfig.fixedNodeSize ?? {
      width: matchCard.width,
      height: matchCard.height,
    },
  };
}

export function buildBracketGraph(
  graph: TournamentBracketProps['graph'],
  hasCustomVertexComponent: boolean,
  matchCard: ResolvedMatchCardStyle
): TournamentBracketProps['graph'] {
  const graphWithPaths = injectTournamentPathKeys(graph);
  if (hasCustomVertexComponent) return graphWithPaths;

  const sizedNodes = Object.entries(graphWithPaths.nodes ?? {}).reduce<
    NonNullable<TournamentBracketProps['graph']['nodes']>
  >((acc, [nodeId, attrs]) => {
    acc[nodeId] = { ...attrs, size: { width: matchCard.width, height: matchCard.height } };
    return acc;
  }, {});

  return { ...graphWithPaths, nodes: sizedNodes };
}

export function resolveBadgeText(
  badgeText: string | undefined,
  graph: TournamentBracketProps['graph'],
  labels: readonly string[]
) {
  if (badgeText) return badgeText;
  const nodeCount = Object.keys(graph.nodes ?? {}).length;
  const finalLabel = labels.at(-1) ?? 'FINAL';
  return nodeCount > 0 ? `${finalLabel} · ${nodeCount} MATCHES` : finalLabel;
}

export function getTranslateExtent(
  stageViews: readonly StageView[]
): readonly [readonly [number, number], readonly [number, number]] | undefined {
  if (stageViews.length === 0) return undefined;
  const padding = 64;

  return [
    [
      Math.min(...stageViews.map((stage) => stage.bounds.minX)) - padding,
      Math.min(...stageViews.map((stage) => stage.bounds.minY)) - padding,
    ],
    [
      Math.max(...stageViews.map((stage) => stage.bounds.maxX)) + padding,
      Math.max(...stageViews.map((stage) => stage.bounds.maxY)) + padding,
    ],
  ];
}
