import '@testing-library/jest-dom/vitest'

// Radix UI and other libs use ResizeObserver — polyfill for jsdom
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Radix UI uses PointerEvent features not in jsdom
if (!window.PointerEvent) {
  class PointerEvent extends MouseEvent {
    constructor(type: string, init?: PointerEventInit) {
      super(type, init)
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(window as any).PointerEvent = PointerEvent
}

// Element.hasPointerCapture is needed by Radix UI Select
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}

// Radix UI Dialog uses scrollIntoView
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
