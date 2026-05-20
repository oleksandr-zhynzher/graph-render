import { useBracketAppearance } from '../../../contexts/BracketAppearanceContext';

interface StageLabelGridProps {
  readonly labels: readonly string[];
  readonly isDarkMode: boolean;
}

export function StageLabelGrid({ labels, isDarkMode }: StageLabelGridProps) {
  const { colors, stageLabels, typography } = useBracketAppearance();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))`,
        gap: stageLabels.gridGap,
      }}
    >
      {labels.map((label, index) => (
        <div
          key={`${label}-${index}`}
          data-testid="stage-label-cell"
          style={{
            display: 'grid',
            justifyItems: 'center',
            gap: 8,
            minWidth: 0,
            padding: '6px 10px',
          }}
        >
          <div
            style={{
              width: 40,
              height: 1,
              background: isDarkMode ? 'rgba(216, 210, 199, 0.24)' : 'rgba(68, 75, 85, 0.16)',
            }}
          />
          <div
            style={{
              fontFamily: typography.bodyFontFamily,
              fontSize: stageLabels.labelFontSize,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: colors.LABEL_TEXT,
              textAlign: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
