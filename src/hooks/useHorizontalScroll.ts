import { useEffect } from 'react';

export function useHorizontalScroll(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    let isDragging = false; // to prevent accidental clicks when dragging

    // Removed handleWheel to prevent vertical wheel-jacking which causes severe page scrolling lag and jank.
    // Native horizontal gestures (like trackpad swipe) and click-drag mouse scrolling will still function perfectly.

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true;
      isDragging = false;
      el.classList.add('cursor-grabbing');
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
    };

    const handleMouseUp = () => {
      isDown = false;
      el.classList.remove('cursor-grabbing');
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      isDragging = true;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 2; // scroll-fast
      el.scrollLeft = scrollLeft - walk;
    };

    const captureClick = (e: MouseEvent) => {
      if (isDragging) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mouseleave', handleMouseLeave);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('click', captureClick, { capture: true });

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mouseleave', handleMouseLeave);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('click', captureClick, { capture: true });
    };
  }, [ref]);
}
