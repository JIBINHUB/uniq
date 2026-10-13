"use client";

import { useEffect, useRef, useState } from "react";
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
  const pathname = usePathname();
  const tone = pathname === "/" ? "dark" : "light";

  return (
    <div
      className={`site-loading-screen${initial ? " is-initial" : ""}`}
      data-tone={tone}
      role="status"
      aria-live="polite"
      aria-label="Loading UNIQ FLOORS"
    >
      <div className="site-loader-content">
        <LoaderMark />
        <div className="site-loader-wordmark">UNIQ FLOORS</div>
        <div className="site-loader-caption">Flooring, clearly chosen.</div>
      </div>
    </div>
  );
}

function waitForVisualPage({ initial }: { initial: boolean }) {
  const startedAt = performance.now();
  // The first reveal completes one full UNIQ mark animation. Route changes
  // remain resource-led and therefore clear as soon as their visual content
  // is ready.
  const minimumDisplay = initial ? 3350 : 260;
  const maximumWait = 7000;

  const visibleImages = Array.from(document.querySelectorAll<HTMLImageElement>("main img"))
    .filter((image) => {
      const bounds = image.getBoundingClientRect();
      const styles = window.getComputedStyle(image);
      return (
        styles.display !== "none" &&
        styles.visibility !== "hidden" &&
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.top < window.innerHeight * 1.6
      );
    })
    .slice(0, 18);

  const imagePromises = visibleImages.map((image) => {
    if (image.complete && image.naturalWidth > 0) {
      return image.decode?.().catch(() => undefined) ?? Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const finish = async () => {
        image.removeEventListener("load", finish);
        image.removeEventListener("error", finish);
        try {
          await image.decode?.();
        } catch {
          // A loaded image may reject decode in Safari; it is still safe to
          // reveal because the browser has completed the network resource.
        }
        resolve();
      };
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
    });
  });

  const visibleVideos = Array.from(
    document.querySelectorAll<HTMLVideoElement>("main video"),
  )
    .filter((video) => {
      const bounds = video.getBoundingClientRect();
      const styles = window.getComputedStyle(video);
      return (
        styles.display !== "none" &&
        styles.visibility !== "hidden" &&
        bounds.width > 0 &&
        bounds.height > 0 &&
        bounds.top < window.innerHeight * 1.25
      );
    })
    .slice(0, 3);

  const videoPromises = visibleVideos.map((video) => {
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const finish = () => {
        video.removeEventListener("loadeddata", finish);
        video.removeEventListener("error", finish);
        resolve();
      };
      video.addEventListener("loadeddata", finish, { once: true });
      video.addEventListener("error", finish, { once: true });
    });
  });

  const fontsReady =
    "fonts" in document ? document.fonts.ready.then(() => undefined) : Promise.resolve();
  const assetsReady = Promise.all([
    fontsReady,
    ...imagePromises,
    ...videoPromises,
  ]).then(() => undefined);
  const timeout = new Promise<void>((resolve) => {
    window.setTimeout(resolve, maximumWait);
  });

  return Promise.race([assetsReady, timeout]).then(
    () =>
      new Promise<void>((resolve) => {
        const elapsed = performance.now() - startedAt;
        window.setTimeout(resolve, Math.max(0, minimumDisplay - elapsed));
      }),
  );
}

export function SiteTransitionLoader() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const transitionIdRef = useRef(0);
  const clickSafetyTimerRef = useRef<number | null>(null);
  const initialRevealRef = useRef(true);

  useEffect(() => {
    const transitionId = transitionIdRef.current + 1;
    transitionIdRef.current = transitionId;
    if (clickSafetyTimerRef.current) {
      window.clearTimeout(clickSafetyTimerRef.current);
      clickSafetyTimerRef.current = null;
    }
    setMounted(true);
    setLeaving(false);

    let removeTimer = 0;
    let cancelled = false;

    const reveal = async () => {
      const initial = initialRevealRef.current;
      await new Promise<void>((resolve) => {
        window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()));
      });
      await waitForVisualPage({ initial });

      if (cancelled || transitionIdRef.current !== transitionId) return;
      initialRevealRef.current = false;
      setLeaving(true);
      removeTimer = window.setTimeout(() => {
        if (transitionIdRef.current === transitionId) setMounted(false);
      }, 380);
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
      if (
        destination.pathname === window.location.pathname &&
        destination.search === window.location.search
      ) {
        return;
      }

      transitionIdRef.current += 1;
      setLeaving(false);
      setMounted(true);

      if (clickSafetyTimerRef.current) {
        window.clearTimeout(clickSafetyTimerRef.current);
      }
      clickSafetyTimerRef.current = window.setTimeout(() => {
        setLeaving(true);
        window.setTimeout(() => setMounted(false), 380);
      }, 8000);
    };

    document.addEventListener("click", handleInternalNavigation, true);
    return () => {
      document.removeEventListener("click", handleInternalNavigation, true);
      if (clickSafetyTimerRef.current) {
        window.clearTimeout(clickSafetyTimerRef.current);
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
