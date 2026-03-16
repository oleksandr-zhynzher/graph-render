import React from 'react';

interface BracketToolbarProps {
  isDarkMode: boolean;
  isNavigationMode: boolean;
  onToggleDarkMode: () => void;
  onToggleNavigationMode: () => void;
  onExportSVG: () => void;
}

const iconSize = 16;

const DownloadIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 4v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path
      d="m8.5 10.5 3.5 3.5 3.5-3.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const SunMoonIcon = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {isDarkMode ? (
      <>
        <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 2.5v2.25M12 19.25v2.25M4.75 12H2.5M21.5 12h-2.25M5.78 5.78 4.2 4.2M19.8 19.8l-1.58-1.58M18.22 5.78 19.8 4.2M4.2 19.8l1.58-1.58"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>
    ) : (
      <path
        d="M20 14.7A8.5 8.5 0 0 1 9.3 4a8.5 8.5 0 1 0 10.7 10.7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

const NavigationIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect
      x="3.5"
      y="5"
      width="17"
      height="14"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.8"
      opacity={isActive ? 1 : 0.9}
    />
    <path d="M8.5 5v14M15.5 5v14" stroke="currentColor" strokeWidth="1.4" opacity={0.7} />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" />
  </svg>
);

export const BracketToolbar = React.memo<BracketToolbarProps>(function BracketToolbar({
  isDarkMode,
  isNavigationMode,
  onToggleDarkMode,
  onToggleNavigationMode,
  onExportSVG,
}) {
  const buttonBaseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 10,
    border: `1px solid ${isDarkMode ? '#38424d' : '#e4ded2'}`,
    background: isDarkMode ? '#232b33' : '#f7f3ec',
    color: isDarkMode ? '#f7f5ef' : '#4b5563',
    cursor: 'pointer',
    boxShadow: 'none',
    transition: 'background-color 120ms ease, color 120ms ease, transform 120ms ease',
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
      }}
    >
      <button type="button" onClick={onExportSVG} style={buttonBaseStyle} title="Export as SVG">
        <DownloadIcon />
      </button>

      <button
        type="button"
        onClick={onToggleNavigationMode}
        style={{
          ...buttonBaseStyle,
          background: isNavigationMode
            ? isDarkMode
              ? '#33403d'
              : '#e7ede3'
            : buttonBaseStyle.background,
          borderColor: isNavigationMode
            ? isDarkMode
              ? '#6d8470'
              : '#b8c7ae'
            : (buttonBaseStyle.border as string),
          color: isNavigationMode ? (isDarkMode ? '#f5f8f2' : '#516347') : buttonBaseStyle.color,
        }}
        title={isNavigationMode ? 'Exit Navigation Mode' : 'Enter Navigation Mode'}
      >
        <NavigationIcon isActive={isNavigationMode} />
      </button>

      <button
        type="button"
        onClick={onToggleDarkMode}
        style={buttonBaseStyle}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <SunMoonIcon isDarkMode={isDarkMode} />
      </button>
    </div>
  );
});

BracketToolbar.displayName = 'BracketToolbar';
