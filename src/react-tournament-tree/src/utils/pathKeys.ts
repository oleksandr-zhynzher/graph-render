import type { NxGraphInput } from '@graph-render/types';

/**
 * Enrich tournament nodes with a generic `meta.pathKeys` array derived from
 * `meta.players[*].name` so shared graph path traversal can follow players
 * across rounds.
 */
export function injectTournamentPathKeys(graph: NxGraphInput): NxGraphInput {
  if (!graph.nodes) {
    return graph;
  }

  let changed = false;
  const nextNodes: typeof graph.nodes = {};

  for (const [id, attrs] of Object.entries(graph.nodes)) {
    const players = (attrs.meta as Record<string, unknown> | undefined)?.players;
    if (!Array.isArray(players) || players.length === 0) {
      nextNodes[id] = attrs;
      continue;
    }

    const names = players
      .map((player) => {
        if (
          player &&
          typeof player === 'object' &&
          typeof (player as Record<string, unknown>).name === 'string'
        ) {
          return ((player as Record<string, unknown>).name as string).trim();
        }

        return '';
      })
      .filter(Boolean);

    if (names.length === 0) {
      nextNodes[id] = attrs;
      continue;
    }

    changed = true;
    nextNodes[id] = {
      ...attrs,
      meta: { ...(attrs.meta as object | undefined), pathKeys: names } as Record<string, unknown>,
    };
  }

  return changed ? { ...graph, nodes: nextNodes } : graph;
}
