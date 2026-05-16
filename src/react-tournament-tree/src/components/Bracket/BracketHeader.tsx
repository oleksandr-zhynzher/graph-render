import type { SquashThemeColors } from '../../types/squashNode';
import { BracketToolbar } from '../BracketToolbar';
import { TrophyIcon } from '../icons';

interface BracketHeaderProps {
  readonly title: string;
  readonly badgeText: string;
  readonly compact: boolean;
  readonly isDarkMode: boolean;
  readonly isNavigationMode: boolean;
  readonly showToolbar: boolean;
  readonly colors: SquashThemeColors;
  readonly onToggleNavigationMode: () => void;
  readonly onToggleDarkMode: () => void;
  readonly onExportSVG: () => void;
}

export function BracketHeader({
  title,
  badgeText,
  compact,
  isDarkMode,
  isNavigationMode,
  showToolbar,
  colors,
  onToggleNavigationMode,
  onToggleDarkMode,
  onExportSVG,
}: BracketHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minHeight: compact ? 40 : 72,
        padding: compact ? '0 12px' : '0 32px',
        background: colors.HEADER_BG,
        borderBottom: `1px solid ${colors.HEADER_BORDER}`,
      }}
    >
      <div
        style={{
          width: compact ? 18 : 30,
          height: compact ? 18 : 30,
          borderRadius: compact ? 4 : 8,
          display: 'grid',
          placeItems: 'center',
          background: colors.ICON_BG,
          color: colors.ICON_FG,
          flexShrink: 0,
        }}
      >
        <TrophyIcon />
      </div>
      <div
        style={{
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
          fontSize: compact ? 13 : 18,
          fontWeight: 600,
          color: colors.HEADER_TITLE,
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          minHeight: compact ? 18 : 28,
          padding: compact ? '0 7px' : '0 14px',
          borderRadius: 999,
          background: colors.BADGE_BG,
          color: colors.BADGE_TEXT,
          fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
          fontSize: compact ? 9 : 11,
          fontWeight: 600,
          letterSpacing: '0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: colors.BADGE_DOT,
            flexShrink: 0,
          }}
        />
        {badgeText}
      </div>
      {showToolbar ? (
        <BracketToolbar
          isDarkMode={isDarkMode}
          isNavigationMode={isNavigationMode}
          onToggleNavigationMode={onToggleNavigationMode}
          onToggleDarkMode={onToggleDarkMode}
          onExportSVG={onExportSVG}
        />
      ) : null}
    </div>
  );
}
