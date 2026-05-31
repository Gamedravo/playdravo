import { useEffect, useRef, useState, type RefObject } from 'react';

interface UseInViewportOptions {
  rootMargin?: string;
  threshold?: number;
  /** Stop observing after first intersection (default true). */
  once?: boolean;
}

export function useInViewport<T extends Element>(
  options: UseInViewportOptions = {}
): [RefObject<T | null>, boolean] {
  const { rootMargin = '300px 0px', threshold = 0, once = true } = options;
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  const frozenRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || (once && frozenRef.current)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) {
            frozenRef.current = true;
            observer.disconnect();
          }
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return [ref, inView];
}
