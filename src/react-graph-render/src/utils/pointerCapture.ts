export const setPointerCaptureIfAvailable = (target: Element, pointerId: number): void => {
  if ('setPointerCapture' in target && typeof target.setPointerCapture === 'function') {
    target.setPointerCapture(pointerId);
  }
};

export const releasePointerCaptureIfAvailable = (target: Element, pointerId: number): void => {
  if (
    'hasPointerCapture' in target &&
    typeof target.hasPointerCapture === 'function' &&
    target.hasPointerCapture(pointerId) &&
    'releasePointerCapture' in target &&
    typeof target.releasePointerCapture === 'function'
  ) {
    target.releasePointerCapture(pointerId);
  }
};
