/** Ensures only one card hover preview plays video at a time (performance). */
type Listener = (activeId: string | null) => void;

let activeId: string | null = null;
const listeners = new Set<Listener>();

export function claimHoverPreview(id: string) {
  activeId = id;
  listeners.forEach((fn) => fn(activeId));
}

export function releaseHoverPreview(id: string) {
  if (activeId !== id) return;
  activeId = null;
  listeners.forEach((fn) => fn(activeId));
}

export function getActiveHoverPreviewId() {
  return activeId;
}

export function subscribeHoverPreview(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
