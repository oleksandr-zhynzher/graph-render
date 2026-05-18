import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { StageStepButton } from '../Bracket/stage-labels/StageStepButton';

const BUTTON_LABEL = 'Next stage';

const defaultProps = {
  label: BUTTON_LABEL,
  disabled: false,
  border: '#cccccc',
  color: '#333333',
  children: <span>→</span>,
  onClick: vi.fn(),
};

describe('StageStepButton', () => {
  it('renders with the given aria-label', () => {
    render(<StageStepButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: BUTTON_LABEL })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<StageStepButton {...defaultProps} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: BUTTON_LABEL }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('is disabled when disabled prop is true', () => {
    render(<StageStepButton {...defaultProps} disabled />);
    expect(screen.getByRole('button', { name: BUTTON_LABEL })).toBeDisabled();
  });

  it('renders children', () => {
    render(<StageStepButton {...defaultProps} />);
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('does not call onClick when disabled and clicked', () => {
    const onClick = vi.fn();
    render(<StageStepButton {...defaultProps} disabled onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: BUTTON_LABEL }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
