type ColorIconProps = {
  color: string;
};

const iconSize = 16;

export const ChevronLeftIcon = ({ color }: ColorIconProps) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m14.5 5-7 7 7 7" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

export const ChevronRightIcon = ({ color }: ColorIconProps) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m9.5 5 7 7-7 7" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

export const ChevronUpIcon = ({ color }: ColorIconProps) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m5 14.5 7-7 7 7" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

export const ChevronDownIcon = ({ color }: ColorIconProps) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="m5 9.5 7 7 7-7" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
  </svg>
);

export const StageNavigationIcon = ({ color }: ColorIconProps) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="14" rx="3" stroke={color} strokeWidth="1.8" />
    <path d="M8.5 5v14M15.5 5v14" stroke={color} strokeWidth="1.4" opacity="0.72" />
    <circle cx="12" cy="12" r="2.2" fill={color} />
  </svg>
);

export const TrophyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M8 3h8v3a4 4 0 0 1-8 0V3Z" fill="currentColor" />
    <path d="M6 5H4a2 2 0 0 0 2 2M18 5h2a2 2 0 0 1-2 2" stroke="currentColor" />
    <path d="M12 10v4M9 21h6M10 18h4" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export const DownloadIcon = () => (
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

export const SunMoonIcon = ({ isDarkMode }: { isDarkMode: boolean }) => (
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

export const ToolbarNavigationIcon = ({ isActive }: { isActive: boolean }) => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="3.5" y="5" width="17" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
    <path d="M8.5 5v14M15.5 5v14" stroke="currentColor" strokeWidth="1.4" opacity={0.7} />
    <circle cx="12" cy="12" r="2.2" fill="currentColor" opacity={isActive ? 1 : 0.9} />
  </svg>
);
