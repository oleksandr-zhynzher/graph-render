export function ensureSquashNodeAnimations(): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (document.querySelector('style[data-squash-node-animations]')) {
    return;
  }

  const styleTag = document.createElement('style');
  styleTag.dataset['squashNodeAnimations'] = 'true';
  styleTag.textContent = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-squash-live-indicator] {
        animation: none !important;
      }
    }
  `;
  document.head.append(styleTag);
}
