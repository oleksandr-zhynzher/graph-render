import fs from 'fs';
import path from 'path';
import { renderGraphToSvg } from './rendering/svg';
import { NxGraphInput, LayoutType, LayoutDirection } from '@graph-render/types';

const sampleGraph: NxGraphInput = {
  nodes: {
    final: { label: 'Final' },
    semiA: { label: 'Semi A' },
    semiB: { label: 'Semi B' },
    qf1: { label: 'QF 1' },
    qf2: { label: 'QF 2' },
    qf3: { label: 'QF 3' },
    qf4: { label: 'QF 4' },
  },
  adj: {
    final: {},
    semiA: { final: {} },
    semiB: { final: {} },
    qf1: { semiA: {} },
    qf2: { semiA: {} },
    qf3: { semiB: {} },
    qf4: { semiB: {} },
  },
};

const outFile = process.argv[2] ?? 'graph.svg';
const outPath = path.resolve(process.cwd(), outFile);

const { svg } = renderGraphToSvg(sampleGraph, {
  config: {
    layout: LayoutType.Tree,
    layoutDirection: LayoutDirection.LTR,
    width: 900,
    height: 600,
    padding: 24,
    curveEdges: true,
    curveStrength: 0.24,
    theme: {
      background: '#ffffff',
      edgeColor: '#3f434b',
      edgeWidth: 2,
      nodeGap: 72,
      fontFamily: '"Space Grotesk", "Segoe UI", system-ui, sans-serif',
    },
    labels: ['QF', 'SF', 'Final'],
    labelOffset: 40,
  },
  title: 'Rendered Graph',
  desc: 'SVG generated server-side using renderGraphToSvg.',
});

fs.writeFileSync(outPath, svg, 'utf8');
console.log(`Wrote SVG to ${outPath}`);
