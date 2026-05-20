import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  DownloadIcon,
  StageNavigationIcon,
  SunMoonIcon,
  ToolbarNavigationIcon,
  TrophyIcon,
} from '../icons';

const COLOR = '#333';

function svgCount(container: HTMLElement): number {
  return container.querySelectorAll('svg').length;
}

describe('Icons', () => {
  it('ChevronLeftIcon renders an SVG', () => {
    const { container } = render(<ChevronLeftIcon color={COLOR} />);
    expect(svgCount(container)).toBe(1);
  });

  it('ChevronRightIcon renders an SVG', () => {
    const { container } = render(<ChevronRightIcon color={COLOR} />);
    expect(svgCount(container)).toBe(1);
  });

  it('ChevronUpIcon renders an SVG', () => {
    const { container } = render(<ChevronUpIcon color={COLOR} />);
    expect(svgCount(container)).toBe(1);
  });

  it('ChevronDownIcon renders an SVG', () => {
    const { container } = render(<ChevronDownIcon color={COLOR} />);
    expect(svgCount(container)).toBe(1);
  });

  it('StageNavigationIcon renders an SVG', () => {
    const { container } = render(<StageNavigationIcon color={COLOR} />);
    expect(svgCount(container)).toBe(1);
  });

  it('TrophyIcon renders an SVG', () => {
    const { container } = render(<TrophyIcon />);
    expect(svgCount(container)).toBe(1);
  });

  it('DownloadIcon renders an SVG', () => {
    const { container } = render(<DownloadIcon />);
    expect(svgCount(container)).toBe(1);
  });

  it('SunMoonIcon renders a sun (light mode = false)', () => {
    render(<SunMoonIcon isDarkMode={false} />);
    // Moon path rendered in light mode
    expect(screen.getByTestId('moon-icon-path')).toBeInTheDocument();
    // No circle in moon mode
    expect(screen.queryByTestId('sun-icon-circle')).not.toBeInTheDocument();
  });

  it('SunMoonIcon renders a sun (dark mode = true)', () => {
    render(<SunMoonIcon isDarkMode />);
    // Sun rays rendered with circle
    expect(screen.getByTestId('sun-icon-circle')).toBeInTheDocument();
  });

  it('ToolbarNavigationIcon renders an SVG (inactive)', () => {
    const { container } = render(<ToolbarNavigationIcon isActive={false} />);
    expect(svgCount(container)).toBe(1);
  });

  it('ToolbarNavigationIcon renders an SVG (active)', () => {
    const { container } = render(<ToolbarNavigationIcon isActive />);
    expect(svgCount(container)).toBe(1);
  });

  it('all icon SVGs are aria-hidden', () => {
    function check(icon: Parameters<typeof render>[0], testId: string) {
      const { unmount } = render(icon);
      expect(screen.getByTestId(testId)).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
    check(<ChevronLeftIcon color={COLOR} />, 'icon-svg');
    check(<ChevronRightIcon color={COLOR} />, 'icon-svg');
    check(<ChevronUpIcon color={COLOR} />, 'icon-svg');
    check(<ChevronDownIcon color={COLOR} />, 'icon-svg');
    check(<StageNavigationIcon color={COLOR} />, 'icon-svg');
    check(<TrophyIcon />, 'trophy-icon');
    check(<DownloadIcon />, 'icon-svg');
    check(<SunMoonIcon isDarkMode={false} />, 'icon-svg');
    check(<ToolbarNavigationIcon isActive={false} />, 'icon-svg');
  });
});
