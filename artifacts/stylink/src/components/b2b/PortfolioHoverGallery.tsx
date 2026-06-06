import { useEffect, useMemo, useState } from "react";
import { getProductsByDesigner } from "@/data/mockData";

interface PortfolioHoverGalleryProps {
  designerId: string;
  /** When true, the carousel overlay fades in and starts auto-rotating. */
  active: boolean;
  /** Max images to show (capped to available). Defaults to 6. */
  max?: number;
  /** Auto-rotation interval in ms. Defaults to 1500. */
  intervalMs?: number;
}

export default function PortfolioHoverGallery({
  designerId,
  active,
  max = 6,
  intervalMs = 1500,
}: PortfolioHoverGalleryProps) {
  const images = useMemo(() => {
    const products = getProductsByDesigner(designerId);
    const urls = products.map((p) => p.image).filter(Boolean);
    const unique = Array.from(new Set(urls));
    return unique.slice(0, Math.max(3, Math.min(max, unique.length)));
  }, [designerId, max]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || images.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [active, images.length, intervalMs]);

  useEffect(() => {
    if (!active) setIndex(0);
  }, [active]);

  if (images.length === 0) return null;

  return (
    <div
      className={`absolute inset-0 transition-opacity duration-300 ease-out ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      data-testid={`portfolio-gallery-${designerId}`}
      aria-hidden={!active}
    >
      {/* Stacked images, fade between */}
      <div className="absolute inset-0 bg-muted">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </div>

      {/* Bottom gradient + dots indicator */}
      <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/90 font-medium">
          Portfolio · {images.length}
        </span>
        <div className="flex gap-1" aria-hidden="true">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-4 bg-white" : "w-1 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
