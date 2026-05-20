import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { getNavigationColors, RoundNavigationButton } from '../Bracket/navigation/NavigationButton';

describe('getNavigationColors', () => {
  it('returns light-mode colors when isDarkMode is false', () => {
    const colors = getNavigationColors(false);
    expect(colors.text).toBe('#3f4a38');
    expect(colors.background).toContain('255, 255, 255');
    expect(colors.border).toBe('#ddd7cb');
    expect(colors.shadow).toContain('45, 45, 45');
  });

  it('returns dark-mode colors when isDarkMode is true', () => {
    const colors = getNavigationColors(true);
    expect(colors.text).toBe('#f7f5ef');
    expect(colors.background).toContain('35, 43, 51');
    expect(colors.border).toBe('#46505c');
    expect(colors.shadow).toContain('0, 0, 0');
  });
});

describe('RoundNavigationButton', () => {
  const baseProps = {
    label: 'Go left',
    disabled: false,
    colors: getNavigationColors(false),
    onClick: vi.fn(),
    children: <span>←</span>,
  };

  it('renders with the given aria-label', () => {
    render(<RoundNavigationButton {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Go left' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<RoundNavigationButton {...baseProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Go left' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<RoundNavigationButton {...baseProps} disabled />);
    const btn = screen.getByRole('button', { name: 'Go left' });
    expect(btn).toBeDisabled();
  });

  it('renders children', () => {
    render(<RoundNavigationButton {...baseProps} />);
    expect(screen.getByText('←')).toBeInTheDocument();
  });

  it('applies custom style', () => {
    render(<RoundNavigationButton {...baseProps} style={{ position: 'absolute', left: 14 }} />);
    const btn = screen.getByRole('button', { name: 'Go left' });
    expect(btn).toHaveStyle({ position: 'absolute' });
  });
});
