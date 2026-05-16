type StageLabelGridProps = {
  labels: string[];
  compact: boolean;
  isDarkMode: boolean;
};

export function StageLabelGrid({ labels, compact, isDarkMode }: StageLabelGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))`,
        gap: compact ? 8 : 24,
      }}
    >
      {labels.map((label, index) => (
        <div
          key={`${label}-${index}`}
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
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: isDarkMode ? '#d8d2c7' : '#444b55',
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
