import { useBracketTheme } from '../../contexts/BracketThemeContext';
import type { StageView, VerticalStagePosition } from '@graph-render/types';
import { BracketHeader } from './BracketHeader';
import { FloatingToolbarButton } from './FloatingToolbarButton';
import { StageLabelBar } from './StageLabelBar';
import { StageNavigationControls } from './StageNavigationControls';

type BracketFrameProps = {
  children: React.ReactNode;
  title: string;
  badgeText: string;
  stageLabels: string[];
  isDarkMode: boolean;
  isNavigationMode: boolean;
  stageViews: StageView[];
  activeStageIndex: number;
  verticalStagePosition: VerticalStagePosition;
  canPagePlayersVertically: boolean;
  contentViewportRef: React.RefObject<HTMLDivElement | null>;
  showToolbar: boolean;
  compact: boolean;
  onToggleNavigationMode: () => void;
  onPreviousStage: () => void;
  onNextStage: () => void;
  onPagePlayersUp: () => void;
  onPagePlayersDown: () => void;
  onToggleDarkMode: () => void;
  onExportSVG: () => void;
};

export function BracketFrame({
  children,
  title,
  badgeText,
  stageLabels,
  isDarkMode,
  isNavigationMode,
  stageViews,
  activeStageIndex,
  verticalStagePosition,
  canPagePlayersVertically,
  contentViewportRef,
  showToolbar,
  compact,
  onToggleNavigationMode,
  onPreviousStage,
  onNextStage,
  onPagePlayersUp,
  onPagePlayersDown,
  onToggleDarkMode,
  onExportSVG,
}: BracketFrameProps) {
  const { colors } = useBracketTheme();
  const canGoPrev = activeStageIndex > 0;
  const canGoNext = activeStageIndex < stageViews.length - 1;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1180,
        background: colors.SURFACE_BG,
        borderRadius: compact ? 10 : 24,
        boxShadow: colors.SHADOW,
        overflow: 'hidden',
      }}
    >
      <BracketHeader
        title={title}
        badgeText={badgeText}
        compact={compact}
        isDarkMode={isDarkMode}
        isNavigationMode={isNavigationMode}
        showToolbar={showToolbar}
        colors={colors}
        onToggleNavigationMode={onToggleNavigationMode}
        onToggleDarkMode={onToggleDarkMode}
        onExportSVG={onExportSVG}
      />
      <StageLabelBar
        stageLabels={stageLabels}
        compact={compact}
        isDarkMode={isDarkMode}
        isNavigationMode={isNavigationMode}
        activeStageIndex={activeStageIndex}
        colors={colors}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPreviousStage={onPreviousStage}
        onNextStage={onNextStage}
      />
      <div
        ref={contentViewportRef}
        style={{
          position: 'relative',
          padding: compact ? '4px 8px 8px' : '12px 24px 24px',
          overflowX: isNavigationMode ? 'hidden' : 'auto',
          overflowY: 'hidden',
          background: isDarkMode
            ? 'radial-gradient(circle at top left, rgba(154, 176, 141, 0.08), transparent 28%), #191e24'
            : 'radial-gradient(circle at top left, rgba(124, 144, 112, 0.08), transparent 28%), #f7f6f3',
        }}
      >
        {children}
        {showToolbar ? (
          <FloatingToolbarButton
            isDarkMode={isDarkMode}
            isNavigationMode={isNavigationMode}
            colors={colors}
            onToggleNavigationMode={onToggleNavigationMode}
          />
        ) : null}
        {isNavigationMode ? (
          <StageNavigationControls
            isDarkMode={isDarkMode}
            activeStageIndex={activeStageIndex}
            stageCount={stageViews.length}
            verticalStagePosition={verticalStagePosition}
            canPagePlayersVertically={canPagePlayersVertically}
            onPreviousStage={onPreviousStage}
            onNextStage={onNextStage}
            onPagePlayersUp={onPagePlayersUp}
            onPagePlayersDown={onPagePlayersDown}
          />
        ) : null}
      </div>
    </div>
  );
}
