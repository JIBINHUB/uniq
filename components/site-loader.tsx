"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type LoadingScreenProps = {
  initial?: boolean;
};

function LoaderMark() {
  return (
    <div className="uniq-loader-mark" aria-hidden="true">
      <div>
        <div>
          <span className="uniq-loader-one uniq-loader-h6" />
          <span className="uniq-loader-two uniq-loader-h3" />
        </div>
      </div>
      <div>
        <div>
          <span className="uniq-loader-one uniq-loader-h1" />
        </div>
      </div>
      <div>
        <div>
          <span className="uniq-loader-two uniq-loader-h2" />
        </div>
      </div>
      <div>
        <div>
          <span className="uniq-loader-one uniq-loader-h4" />
        </div>
      </div>
    </div>
  );
}

export function LoadingScreen({ initial = false }: LoadingScreenProps) {
  return (
    <div
      className={`site-loading-screen${initial ? " is-initial" : ""}`}
      role="status"
      aria-live="polite"
      aria-label="Loading UNIQ FLOORS"
    >
      <div className="site-loader-content">
        <LoaderMark />
        <div className="site-loader-wordmark">UNIQ FLOORS</div>
        <div className="site-loader-caption">Flooring, clearly chosen.</div>
        <div className="site-loader-progress" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}

export function SiteTransitionLoader() {
  const pathname = usePathname();
  const previousPathnameRef = useRef(pathname);
  const [mounted, setMounted] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const transitionIdRef = useRef(0);
  const clickSafetyTimerRef = useRef<number | null>(null);
  const delayedNavigationTimerRef = useRef<number | null>(null);
  const initialRevealRef = useRef(true);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === pathname) return;
    previousPathnameRef.current = pathname;

    // Route changes should begin at the first section. A URL with a hash
    // belongs to an in-page anchor, which the browser/Next.js will position.
    if (!window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname]);

  useEffect(() => {
    const transitionId = transitionIdRef.current + 1;
    transitionIdRef.current = transitionId;
    if (clickSafetyTimerRef.current) {
      window.clearTimeout(clickSafetyTimerRef.current);
      clickSafetyTimerRef.current = null;
    }
    if (delayedNavigationTimerRef.current) {
      window.clearTimeout(delayedNavigationTimerRef.current);
      delayedNavigationTimerRef.current = null;
    }

    let removeTimer = 0;
    let cancelled = false;

    const reveal = async () => {
      const initial = initialRevealRef.current;
      if (initial) {
        setMounted(true);
        setLeaving(false);
        await new Promise<void>((resolve) => {
          window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
        });
        await new Promise<void>((resolve) => window.setTimeout(resolve, 360));
      }

      if (cancelled || transitionIdRef.current !== transitionId) return;
      initialRevealRef.current = false;
      setLeaving(true);
      removeTimer = window.setTimeout(() => {
        if (transitionIdRef.current === transitionId) setMounted(false);
      }, 260);
    };

    void reveal();

    return () => {
      window.clearTimeout(removeTimer);
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    const handleInternalNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname) {
        if (!destination.hash && destination.search === window.location.search) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
        return;
      }

      transitionIdRef.current += 1;
      const navigationId = transitionIdRef.current;

      if (clickSafetyTimerRef.current) {
        window.clearTimeout(clickSafetyTimerRef.current);
      }
      if (delayedNavigationTimerRef.current) {
        window.clearTimeout(delayedNavigationTimerRef.current);
      }
      delayedNavigationTimerRef.current = window.setTimeout(() => {
        if (transitionIdRef.current === navigationId) {
          setLeaving(false);
          setMounted(true);
        }
      }, 160);
      clickSafetyTimerRef.current = window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => setMounted(false), 260);
      }, 2500);
    };

    document.addEventListener("click", handleInternalNavigation, true);
    return () => {
      document.removeEventListener("click", handleInternalNavigation, true);
      if (clickSafetyTimerRef.current) {
        window.clearTimeout(clickSafetyTimerRef.current);
      }
      if (delayedNavigationTimerRef.current) {
        window.clearTimeout(delayedNavigationTimerRef.current);
      }
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={leaving ? "site-loader-exit" : undefined}>
      <LoadingScreen initial />
    </div>
  );
}
