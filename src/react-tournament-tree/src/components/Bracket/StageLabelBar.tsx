import type { SquashThemeColors } from '../../types/squashNode';
import { ChevronLeftIcon, ChevronRightIcon } from '../icons';
import { StageLabelGrid } from './stage-labels/StageLabelGrid';
import { StageStepButton } from './stage-labels/StageStepButton';

interface StageLabelBarProps {
  readonly stageLabels: readonly string[];
  readonly compact: boolean;
  readonly isDarkMode: boolean;
  readonly isNavigationMode: boolean;
  readonly activeStageIndex: number;
  readonly colors: SquashThemeColors;
  readonly canGoPrev: boolean;
  readonly canGoNext: boolean;
  readonly onPreviousStage: () => void;
  readonly onNextStage: () => void;
}

export function StageLabelBar({
  stageLabels,
  compact,
  isDarkMode,
  isNavigationMode,
  activeStageIndex,
  colors,
  canGoPrev,
  canGoNext,
  onPreviousStage,
  onNextStage,
}: StageLabelBarProps) {
  if (stageLabels.length === 0) return null;
  const navColor = isDarkMode ? '#f7f5ef' : '#3f4a38';
  const navBorder = isDarkMode ? '#46505c' : '#ddd7cb';

  return (
    <div
      style={{
        padding: isNavigationMode
          ? compact
            ? '5px 10px'
            : '8px 16px'
          : compact
            ? '5px 12px'
            : '14px 32px 12px',
        background: isDarkMode ? '#20262d' : '#fbfaf7',
        borderBottom: `1px solid ${colors.HEADER_BORDER}`,
      }}
    >
      {isNavigationMode ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <StageStepButton
            label="Previous stage"
            disabled={!canGoPrev}
            border={navBorder}
            color={navColor}
            onClick={onPreviousStage}
          >
            <ChevronLeftIcon color={navColor} />
          </StageStepButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                padding: compact ? '4px 12px' : '5px 16px',
                borderRadius: 999,
                background: colors.ICON_BG,
                color: colors.ICON_FG,
                fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
                fontSize: compact ? 10 : 11,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
            >
              {stageLabels[activeStageIndex] ?? ''}
            </span>
            <span
              style={{
                fontSize: compact ? 10 : 12,
                fontWeight: 500,
                color: isDarkMode ? 'rgba(216, 210, 199, 0.6)' : 'rgba(68, 75, 85, 0.55)',
                whiteSpace: 'nowrap',
              }}
            >
              {activeStageIndex + 1}/{stageLabels.length}
            </span>
          </div>
          <StageStepButton
            label="Next stage"
            disabled={!canGoNext}
            border={navBorder}
            color={navColor}
            onClick={onNextStage}
          >
            <ChevronRightIcon color={navColor} />
          </StageStepButton>
        </div>
      ) : (
        <StageLabelGrid labels={stageLabels} compact={compact} isDarkMode={isDarkMode} />
      )}
    </div>
  );
}
