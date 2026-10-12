"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type SVGProps,
} from "react";
import { money, productBySlug, products } from "@/lib/data";

type Point = { x: number; y: number };
type FloorQuad = [Point, Point, Point, Point];

type LiveRoomVisualizerProps = {
  addToCart: (slug: string, quantity: number) => void;
};

type GlyphProps = SVGProps<SVGSVGElement>;

const defaultQuad: FloorQuad = [
  { x: 0.14, y: 0.5 },
  { x: 0.86, y: 0.5 },
  { x: 1, y: 0.97 },
  { x: 0, y: 0.97 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function interpolate(a: Point, b: Point, amount: number): Point {
  return {
    x: a.x + (b.x - a.x) * amount,
    y: a.y + (b.y - a.y) * amount,
  };
}

function quadPoint(quad: FloorQuad, u: number, v: number): Point {
  const top = interpolate(quad[0], quad[1], u);
  const bottom = interpolate(quad[3], quad[2], u);
  return interpolate(top, bottom, v);
}

function CloseGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7.2 7.2 16.8 16.8M16.8 7.2 7.2 16.8" />
      <circle cx="12" cy="12" r="9.25" />
    </svg>
  );
}

function BackGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m13.8 6.5-5.5 5.5 5.5 5.5M8.8 12h8.8" />
      <path d="M5 5.8A9 9 0 1 0 18.2 5" opacity=".45" />
    </svg>
  );
}

function LensGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <circle cx="16" cy="16" r="12.5" />
      <circle cx="16" cy="16" r="5.25" />
      <path d="M16 3.5 20.2 10M28.5 16 22 20.2M16 28.5 11.8 22M3.5 16 10 11.8" />
    </svg>
  );
}

function SurfaceGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m4 8.2 8-4 8 4-8 4-8-4Z" />
      <path d="m4 12 8 4 8-4M4 15.8l8 4 8-4" opacity=".7" />
    </svg>
  );
}

function AutoFitGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 4H4v4M16 4h4v4M20 16v4h-4M8 20H4v-4" />
      <path d="m8.2 14.8 1.2-3.1 2.6-1.2 1.2-3.1 1.4 3.1 3.1 1.2-3.1 1.3-1.4 3-1.2-3-3.8 1.8Z" />
    </svg>
  );
}

function RevealGlyph({ hidden = false, ...props }: GlyphProps & { hidden?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3.4 12s3.1-5.2 8.6-5.2 8.6 5.2 8.6 5.2-3.1 5.2-8.6 5.2S3.4 12 3.4 12Z" />
      <circle cx="12" cy="12" r="2.6" />
      {hidden ? <path d="m5 4.8 14 14" /> : null}
    </svg>
  );
}

function CartGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5.2 7.3h14l-1.1 8.2H7L5.2 4H2.8" />
      <path d="M9.2 10.2h6.9M9.8 12.8h5.7" opacity=".65" />
      <circle cx="8.5" cy="19" r="1.2" />
      <circle cx="17.2" cy="19" r="1.2" />
    </svg>
  );
}

function RetakeGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M5.2 8.6A7.7 7.7 0 1 1 5 15M5.2 8.6V4.5M5.2 8.6h4.1" />
      <circle cx="12" cy="12" r="2.2" />
    </svg>
  );
}

function CheckGlyph(props: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="m7 12.4 3.1 3.1 7-7" />
      <circle cx="12" cy="12" r="9" opacity=".55" />
    </svg>
  );
}

function drawAffineTriangle(
  context: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  sourcePoints: [Point, Point, Point],
  destinationPoints: [Point, Point, Point],
) {
  const [s0, s1, s2] = sourcePoints;
  const [d0, d1, d2] = destinationPoints;
  const denominator =
    s0.x * (s1.y - s2.y) +
    s1.x * (s2.y - s0.y) +
    s2.x * (s0.y - s1.y);

  if (Math.abs(denominator) < 0.0001) return;

  const a =
    (d0.x * (s1.y - s2.y) +
      d1.x * (s2.y - s0.y) +
      d2.x * (s0.y - s1.y)) /
    denominator;
  const c =
    (d0.x * (s2.x - s1.x) +
      d1.x * (s0.x - s2.x) +
      d2.x * (s1.x - s0.x)) /
    denominator;
  const e =
    (d0.x * (s1.x * s2.y - s2.x * s1.y) +
      d1.x * (s2.x * s0.y - s0.x * s2.y) +
      d2.x * (s0.x * s1.y - s1.x * s0.y)) /
    denominator;
  const b =
    (d0.y * (s1.y - s2.y) +
      d1.y * (s2.y - s0.y) +
      d2.y * (s0.y - s1.y)) /
    denominator;
  const d =
    (d0.y * (s2.x - s1.x) +
      d1.y * (s0.x - s2.x) +
      d2.y * (s1.x - s0.x)) /
    denominator;
  const f =
    (d0.y * (s1.x * s2.y - s2.x * s1.y) +
      d1.y * (s2.x * s0.y - s0.x * s2.y) +
      d2.y * (s0.x * s1.y - s1.x * s0.y)) /
    denominator;

  context.save();
  context.beginPath();
  context.moveTo(d0.x, d0.y);
  context.lineTo(d1.x, d1.y);
  context.lineTo(d2.x, d2.y);
  context.closePath();
  context.clip();
  context.setTransform(a, b, c, d, e, f);
  context.drawImage(source, 0, 0);
  context.restore();
}

function buildPattern(image: HTMLImageElement, scale: number) {
  const surface = document.createElement("canvas");
  surface.width = 1024;
  surface.height = 1024;
  const context = surface.getContext("2d");
  if (!context) return surface;

  context.fillStyle = "#b28a61";
  context.fillRect(0, 0, surface.width, surface.height);

  // Use real flooring proportions rather than repeating a few oversized
  // square texture panels. The longer boards make the perspective read as a
  // continuous fitted floor while keeping enough seams to show scale.
  const plankWidth = clamp(scale * 0.88, 78, 154);
  const plankHeight = clamp(plankWidth * 5, 390, 760);
  const columns = Math.ceil(surface.width / plankWidth) + 4;
  const rows = Math.ceil(surface.height / plankHeight) + 4;

  for (let row = -2; row < rows; row += 1) {
    const offset = row % 2 === 0 ? 0 : plankWidth * 0.5;
    for (let column = -2; column < columns; column += 1) {
      const x = column * plankWidth + offset;
      const y = row * plankHeight;
      context.drawImage(image, x, y, plankWidth - 2, plankHeight - 3);
      context.strokeStyle = "rgba(34, 26, 18, 0.16)";
      context.lineWidth = 2;
      context.strokeRect(x, y, plankWidth - 2, plankHeight - 3);
    }
  }

  return surface;
}

function drawWarpedFloor(
  canvas: HTMLCanvasElement,
  pattern: HTMLCanvasElement,
  quad: FloorQuad,
  opacity: number,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const destinationQuad = quad.map((point) => ({
    x: point.x * canvas.width,
    y: point.y * canvas.height,
  })) as FloorQuad;

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = opacity / 100;

  const columns = 14;
  const rows = 12;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const u0 = column / columns;
      const u1 = (column + 1) / columns;
      const v0 = row / rows;
      const v1 = (row + 1) / rows;
      const sourceTopLeft = { x: u0 * pattern.width, y: v0 * pattern.height };
      const sourceTopRight = { x: u1 * pattern.width, y: v0 * pattern.height };
      const sourceBottomRight = { x: u1 * pattern.width, y: v1 * pattern.height };
      const sourceBottomLeft = { x: u0 * pattern.width, y: v1 * pattern.height };
      const destinationTopLeft = quadPoint(destinationQuad, u0, v0);
      const destinationTopRight = quadPoint(destinationQuad, u1, v0);
      const destinationBottomRight = quadPoint(destinationQuad, u1, v1);
      const destinationBottomLeft = quadPoint(destinationQuad, u0, v1);

      drawAffineTriangle(
        context,
        pattern,
        [sourceTopLeft, sourceTopRight, sourceBottomRight],
        [destinationTopLeft, destinationTopRight, destinationBottomRight],
      );
      drawAffineTriangle(
        context,
        pattern,
        [sourceTopLeft, sourceBottomRight, sourceBottomLeft],
        [destinationTopLeft, destinationBottomRight, destinationBottomLeft],
      );
    }
  }

  context.globalAlpha = 1;
  context.setTransform(1, 0, 0, 1, 0, 0);
}

function drawCover(
  context: CanvasRenderingContext2D,
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  context.drawImage(
    source,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

export function LiveRoomVisualizer({ addToCart }: LiveRoomVisualizerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraFrameRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const autoStartAttemptedRef = useRef(false);
  const feedbackTimerRef = useRef<number | null>(null);

  const [deviceKind, setDeviceKind] = useState<"checking" | "mobile" | "desktop">(
    "checking",
  );
  const [selectedSlug, setSelectedSlug] = useState(products[0].slug);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanState, setScanState] = useState<"idle" | "scanning" | "found">("idle");
  const [points, setPoints] = useState<FloorQuad>(defaultQuad);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState("");
  const [captureBusy, setCaptureBusy] = useState(false);
  const [cartFeedback, setCartFeedback] = useState(false);

  const selectedProduct = useMemo(
    () => productBySlug(selectedSlug),
    [selectedSlug],
  );

  const automaticRendering = useMemo(() => {
    const depth = clamp(points[3].y - points[0].y, 0.25, 0.58);
    return {
      scale: clamp(104 + depth * 76, 118, 148),
      blend: selectedProduct.category === "spc" ? 74 : 82,
    };
  }, [points, selectedProduct.category]);

  function stopCamera() {
    if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraReady(false);
    setCameraStarting(false);
    setScanState("idle");
  }

  function scanFloor() {
    const video = videoRef.current;
    const canvas = analysisCanvasRef.current;

    if (previewMode) {
      setScanState("scanning");
      window.setTimeout(() => {
        setPoints(defaultQuad);
        setScanState("found");
      }, 520);
      return;
    }

    if (!video || !canvas || video.readyState < 2) {
      setPoints(defaultQuad);
      setScanState("found");
      return;
    }

    setScanState("scanning");
    const width = 112;
    const height = 144;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      setPoints(defaultQuad);
      setScanState("found");
      return;
    }

    context.drawImage(video, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    const rowLight = new Array<number>(height).fill(0);
    const rowDetail = new Array<number>(height).fill(0);

    for (let y = 0; y < height; y += 1) {
      let luminance = 0;
      let detail = 0;
      let previous = 0;
      let samples = 0;
      for (let x = Math.floor(width * 0.12); x < width * 0.88; x += 2) {
        const index = (y * width + x) * 4;
        const current =
          pixels[index] * 0.2126 +
          pixels[index + 1] * 0.7152 +
          pixels[index + 2] * 0.0722;
        luminance += current;
        if (samples) detail += Math.abs(current - previous);
        previous = current;
        samples += 1;
      }
      rowLight[y] = samples ? luminance / samples : 0;
      rowDetail[y] = samples ? detail / samples : 0;
    }

    let bestRow = Math.floor(height * 0.52);
    let bestScore = -Infinity;
    for (let y = Math.floor(height * 0.35); y < Math.floor(height * 0.7); y += 1) {
      const gradient = Math.abs(rowLight[y] - rowLight[y - 3]);
      const lowerTexture = rowDetail[Math.min(height - 1, y + 12)];
      const score = gradient * 0.78 + lowerTexture * 0.22 + (y / height) * 4;
      if (score > bestScore) {
        bestScore = score;
        bestRow = y;
      }
    }

    const horizon = clamp(bestRow / height + 0.025, 0.43, 0.67);
    const topInset = clamp(0.1 + (horizon - 0.43) * 0.22, 0.1, 0.17);
    setPoints([
      { x: topInset, y: horizon },
      { x: 1 - topInset, y: horizon },
      { x: 1, y: 0.98 },
      { x: 0, y: 0.98 },
    ]);
    window.setTimeout(() => setScanState("found"), 460);
  }

  async function startCamera() {
    setCameraError("");
    setCameraStarting(true);
    setScanState("idle");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "This browser cannot open the rear camera. Use Safari or Chrome on a mobile or tablet over HTTPS.",
      );
      setCameraStarting(false);
      return;
    }

    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) throw new Error("Camera view is unavailable");
      video.srcObject = stream;
      await video.play();
      setCameraReady(true);
      scanTimerRef.current = window.setTimeout(scanFloor, 780);
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      setCameraError(
        name === "NotAllowedError"
          ? "Camera access was declined. Allow camera permission in your browser settings, then try again."
          : "The rear camera could not be opened. Close other camera apps and try once more.",
      );
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    } finally {
      setCameraStarting(false);
    }
  }

  async function captureRoom() {
    if (captureBusy) return;
    setCaptureBusy(true);

    try {
      const frame = cameraFrameRef.current;
      const overlay = overlayCanvasRef.current;
      const video = videoRef.current;
      const bounds = frame?.getBoundingClientRect();
      const width = 1080;
      const height = Math.round(
        width * clamp((bounds?.height || 844) / Math.max(1, bounds?.width || 390), 1.35, 2.2),
      );
      const capture = document.createElement("canvas");
      capture.width = width;
      capture.height = height;
      const context = capture.getContext("2d");
      if (!context) return;

      if (!previewMode && video && video.readyState >= 2) {
        drawCover(
          context,
          video,
          video.videoWidth || width,
          video.videoHeight || height,
          width,
          height,
        );
      } else {
        const preview = await loadImage("/assets/rooms-generated/room-living.webp");
        drawCover(
          context,
          preview,
          preview.naturalWidth,
          preview.naturalHeight,
          width,
          height,
        );
      }

      if (overlayVisible && overlay) {
        context.drawImage(overlay, 0, 0, width, height);
      }

      const shade = context.createLinearGradient(0, 0, 0, height);
      shade.addColorStop(0, "rgba(3,7,4,.14)");
      shade.addColorStop(0.62, "rgba(3,7,4,0)");
      shade.addColorStop(1, "rgba(3,7,4,.58)");
      context.fillStyle = shade;
      context.fillRect(0, 0, width, height);

      context.fillStyle = "rgba(255,255,255,.92)";
      context.font = "600 28px system-ui, sans-serif";
      context.fillText("UNIQ LIVE ROOM", 42, height - 86);
      context.fillStyle = "rgba(255,255,255,.66)";
      context.font = "400 22px system-ui, sans-serif";
      context.fillText(selectedProduct.name, 42, height - 50);

      setCapturedImage(capture.toDataURL("image/jpeg", 0.92));
    } finally {
      setCaptureBusy(false);
    }
  }

  function addSelectedFloor() {
    addToCart(selectedProduct.slug, 1);
    setCartFeedback(true);
    if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    feedbackTimerRef.current = window.setTimeout(() => setCartFeedback(false), 1800);
  }

  useEffect(() => {
    const localCameraPreview =
      process.env.NODE_ENV === "development" &&
      new URLSearchParams(window.location.search).get("cameraPreview") === "1";
    const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(
      navigator.userAgent,
    );
    const iPadDesktopMode =
      /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
    const touchDevice =
      navigator.maxTouchPoints > 1 &&
      window.matchMedia("(pointer: coarse)").matches;

    if (localCameraPreview) {
      setPreviewMode(true);
      setDeviceKind("mobile");
      return;
    }
    setDeviceKind(
      mobileUserAgent || iPadDesktopMode || touchDevice ? "mobile" : "desktop",
    );
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("ar-room-route");
    return () => document.documentElement.classList.remove("ar-room-route");
  }, []);

  useEffect(() => {
    if (deviceKind !== "mobile" || autoStartAttemptedRef.current) return;
    autoStartAttemptedRef.current = true;
    if (previewMode) {
      setCameraReady(true);
      setScanState("found");
      return;
    }
    void startCamera();
  }, [deviceKind, previewMode]);

  useEffect(() => {
    document.documentElement.classList.toggle("ar-camera-open", cameraReady);
    return () => document.documentElement.classList.remove("ar-camera-open");
  }, [cameraReady]);

  useEffect(() => {
    function handleVisibility() {
      if (document.hidden && cameraReady) stopCamera();
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [cameraReady]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (scanTimerRef.current) window.clearTimeout(scanTimerRef.current);
      if (feedbackTimerRef.current) window.clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!cameraReady || !overlayVisible) {
      const canvas = overlayCanvasRef.current;
      const context = canvas?.getContext("2d");
      if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    let animationFrame = 0;
    let stopped = false;
    let frameCount = 0;
    const texture = new window.Image();
    texture.decoding = "async";
    texture.src = selectedProduct.textureImage;

    texture.onload = () => {
      const pattern = buildPattern(texture, automaticRendering.scale);

      const render = () => {
        if (stopped) return;
        const bounds = canvas.getBoundingClientRect();
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const targetWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
        const targetHeight = Math.max(1, Math.round(bounds.height * pixelRatio));
        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
          canvas.width = targetWidth;
          canvas.height = targetHeight;
        }

        drawWarpedFloor(canvas, pattern, points, automaticRendering.blend);

        if (!previewMode && frameCount % 18 === 0 && video.readyState >= 2) {
          const analysis = analysisCanvasRef.current;
          const analysisContext = analysis?.getContext("2d", {
            willReadFrequently: true,
          });
          if (analysis && analysisContext) {
            analysis.width = 24;
            analysis.height = 18;
            analysisContext.drawImage(video, 0, 0, 24, 18);
            const data = analysisContext.getImageData(0, 8, 24, 10).data;
            let luminance = 0;
            for (let index = 0; index < data.length; index += 4) {
              luminance +=
                data[index] * 0.2126 +
                data[index + 1] * 0.7152 +
                data[index + 2] * 0.0722;
            }
            const average = luminance / Math.max(1, data.length / 4);
            const brightness = clamp(0.72 + average / 510, 0.78, 1.16);
            canvas.style.filter = `brightness(${brightness}) saturate(.92) contrast(1.04)`;
          }
        } else if (previewMode) {
          canvas.style.filter = "brightness(.94) saturate(.9) contrast(1.03)";
        }

        frameCount += 1;
        animationFrame = window.requestAnimationFrame(render);
      };

      render();
    };

    return () => {
      stopped = true;
      window.cancelAnimationFrame(animationFrame);
    };
  }, [
    automaticRendering,
    cameraReady,
    overlayVisible,
    points,
    previewMode,
    selectedProduct.textureImage,
  ]);

  if (deviceKind === "checking") {
    return (
      <section className="live-vision-loading" aria-live="polite">
        <span><LensGlyph /></span>
      </section>
    );
  }

  if (deviceKind === "desktop") {
    return (
      <section className="live-device-gate">
        <Link className="live-device-close" href="/" aria-label="Back to home">
          <CloseGlyph />
        </Link>
        <div className="live-device-visual" aria-hidden="true">
          <div className="live-device-orbit live-device-orbit-one" />
          <div className="live-device-orbit live-device-orbit-two" />
          <div className="live-device-phone">
            <span />
            <div>
              <i />
              <b />
            </div>
          </div>
          <em><AutoFitGlyph /></em>
        </div>
        <div className="live-device-copy">
          <span><i /> UNIQ LIVE ROOM</span>
          <h1>Your room. Your floor. Seen together.</h1>
          <p>
            Continue on a mobile or tablet to open the rear camera, automatically
            detect the floor and capture your finished look.
          </p>
          <strong>uniqfloors.vercel.app/rooms</strong>
        </div>
      </section>
    );
  }

  return (
    <section className="live-vision-camera">
      <div
        className={`live-vision-shell ${cameraReady ? "is-ready" : "is-requesting"} ${
          previewMode ? "is-preview" : ""
        }`}
      >
        <div className="live-vision-frame" ref={cameraFrameRef}>
          <video
            ref={videoRef}
            muted
            playsInline
            autoPlay
            aria-label="Live rear camera view of your room"
          />
          <canvas
            className="live-vision-floor"
            ref={overlayCanvasRef}
            aria-label={`${selectedProduct.name} automatically fitted floor overlay`}
          />
          <canvas className="live-vision-analysis" ref={analysisCanvasRef} />

          {!cameraReady ? (
            <div className="live-vision-permission">
              <Link href="/" aria-label="Back to home"><BackGlyph /></Link>
              <div className="live-permission-lens">
                {cameraStarting ? <AutoFitGlyph /> : <LensGlyph />}
              </div>
              {cameraStarting ? (
                <>
                  <span>CONNECTING TO REAR CAMERA</span>
                  <div className="live-vision-loader"><i /><i /><i /></div>
                </>
              ) : (
                <>
                  <span>PRIVATE ON-DEVICE VIEW</span>
                  <h1>See the floor before it arrives.</h1>
                  <p>
                    Allow rear-camera access. UNIQ automatically detects the floor;
                    no manual scaling or footage upload is required.
                  </p>
                  <button type="button" onClick={() => void startCamera()}>
                    <LensGlyph /> Open Live Room
                  </button>
                </>
              )}
              {cameraError ? <small>{cameraError}</small> : null}
            </div>
          ) : (
            <>
              <div className="live-vision-topbar">
                <Link href="/" onClick={stopCamera} aria-label="Close Live Room">
                  <CloseGlyph />
                </Link>
                <div className="live-vision-mode">
                  <img
                    src="/assets/brand/uniq-header-logo.png"
                    alt="UNIQ Floors Live Room"
                  />
                  <span>AUTO</span>
                </div>
                <div className="live-vision-top-actions">
                  <button
                    type="button"
                    onClick={() => setOverlayVisible((current) => !current)}
                    aria-label={overlayVisible ? "Hide floor preview" : "Show floor preview"}
                  >
                    <RevealGlyph hidden={!overlayVisible} />
                  </button>
                  <button type="button" onClick={scanFloor} aria-label="Detect floor again">
                    <AutoFitGlyph />
                  </button>
                </div>
              </div>

              <div className={`live-auto-plane state-${scanState}`} aria-hidden="true">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon
                    points={points
                      .map((point) => `${point.x * 100},${point.y * 100}`)
                      .join(" ")}
                  />
                  <path d="M14 50 0 97M86 50l14 47M50 50v47" />
                </svg>
              </div>

              <div className={`live-scan-status state-${scanState}`}>
                {scanState === "scanning" ? <AutoFitGlyph /> : <CheckGlyph />}
                <span>
                  {scanState === "scanning" ? "READING SURFACE" : "FLOOR FITTED AUTOMATICALLY"}
                </span>
              </div>

              <div className="live-floor-focus">
                <small>SELECTED PALETTE</small>
                <strong>{selectedProduct.colour}</strong>
              </div>

              <div className="live-vision-bottom">
                <div className="live-palette-reel" aria-label="Choose a flooring palette">
                  {products.map((product) => (
                    <button
                      className={product.slug === selectedSlug ? "active" : ""}
                      type="button"
                      onClick={() => setSelectedSlug(product.slug)}
                      aria-label={`Apply ${product.name}`}
                      key={product.slug}
                    >
                      <span><img src={product.textureImage} alt="" /></span>
                      <small>{product.colour}</small>
                    </button>
                  ))}
                </div>

                <div className="live-capture-controls">
                  <button type="button" onClick={scanFloor} aria-label="Automatically refit floor">
                    <AutoFitGlyph />
                    <small>Auto fit</small>
                  </button>
                  <button
                    className={`live-capture-shutter ${captureBusy ? "is-busy" : ""}`}
                    type="button"
                    onClick={() => void captureRoom()}
                    aria-label="Capture room image"
                  >
                    <LensGlyph />
                  </button>
                  <button type="button" onClick={addSelectedFloor} aria-label="Add selected floor to cart">
                    {cartFeedback ? <CheckGlyph /> : <CartGlyph />}
                    <small>{cartFeedback ? "Added" : "Add"}</small>
                  </button>
                </div>

                <div className="live-product-dock">
                  <span style={{ backgroundImage: `url(${selectedProduct.textureImage})` }} />
                  <div>
                    <small>{selectedProduct.finish}</small>
                    <strong>{selectedProduct.name}</strong>
                  </div>
                  <button type="button" onClick={addSelectedFloor}>
                    {cartFeedback ? "Added" : "Add to cart"}
                    <b>{money(selectedProduct.price)} / m²</b>
                  </button>
                </div>
              </div>

              {capturedImage ? (
                <div className="live-capture-review" role="dialog" aria-modal="true" aria-label="Captured room preview">
                  <div className="live-capture-review-image">
                    <img src={capturedImage} alt={`Captured room with ${selectedProduct.name}`} />
                    <button type="button" onClick={() => setCapturedImage("")} aria-label="Close captured preview">
                      <CloseGlyph />
                    </button>
                    <span><CheckGlyph /> FLOOR PREVIEW CAPTURED</span>
                  </div>
                  <div className="live-capture-review-copy">
                    <div>
                      <small>YOUR LIVE ROOM</small>
                      <strong>{selectedProduct.name}</strong>
                      <span>{money(selectedProduct.price)} / m²</span>
                    </div>
                    <button type="button" onClick={() => setCapturedImage("")}>
                      <RetakeGlyph /> Retake
                    </button>
                    <button type="button" onClick={addSelectedFloor}>
                      {cartFeedback ? <CheckGlyph /> : <CartGlyph />}
                      {cartFeedback ? "Added to cart" : "Add this floor"}
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
