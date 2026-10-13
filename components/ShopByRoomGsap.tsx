"use client";

import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const roomPills = [
  ["Living Room", "/room/living", "/assets/real/living-oak.jpg"],
  ["Kitchen", "/room/kitchen", "/assets/real/kitchen-oak.jpg"],
  ["Bedroom", "/room/bedroom", "/assets/real/bed-wood.jpg"],
  ["Bathroom", "/room/bathroom", "/assets/real/bath-wood.jpg"],
  ["Hallway", "/room/hallway", "/assets/real/hallway-oak.jpg"],
];

export function ShopByRoomGsap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Staggered popup animation for the cards
      gsap.from(".gsap-room-card", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%", // triggers when top of container is 75% down the viewport
        },
        y: 80,
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });

      // Simple fade up for the header
      gsap.from(".gsap-header-element", {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} className="shop-room-gsap-section">
      <div className="gsap-container">
        <div className="gsap-header">
          <span className="gsap-eyebrow gsap-header-element">Room edits</span>
          <h2 className="gsap-title gsap-header-element">Shop by room</h2>
          <p className="gsap-copy gsap-header-element">
            Choose a space and open a curated floor edit with real room-led imagery.
          </p>
        </div>

        <div className="gsap-grid">
          {roomPills.map(([name, href, image], index) => (
            <Link className="gsap-room-card" href={href} key={name}>
              <div className="card-image-wrapper">
                <img src={image} alt={`${name} flooring inspiration`} />
                <div className="card-overlay" />
                <span className="card-number">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="card-content">
                <strong>{name}</strong>
                <em>Explore edit <span>→</span></em>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .shop-room-gsap-section {
          background-color: #000000;
          color: #ffffff;
          padding: 6rem 2rem;
          font-family: 'PPNeueMontrealMono', monospace;
          overflow: hidden;
        }

        .gsap-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 4rem;
        }

        .gsap-header {
          max-width: 500px;
        }

        .gsap-eyebrow {
          display: inline-block;
          color: #c9fe6e;
          text-transform: uppercase;
          font-size: 11px; /* font.size.xs */
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }

        .gsap-title {
          font-size: clamp(2.5rem, 5vw, 44px); /* font.size.4xl max */
          line-height: 1.1;
          margin: 0 0 1.5rem;
          font-weight: 500;
        }

        .gsap-copy {
          color: #999999;
          font-size: 13px; /* font.size.md/base */
          line-height: 19.37px;
          margin: 0;
        }

        .gsap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }

        .gsap-room-card {
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: #ffffff;
          border-radius: 20px; /* radius.sm */
          overflow: hidden;
          background: #0a0a0b;
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: border-color 300ms ease; /* motion.duration.normal */
        }

        .gsap-room-card:hover,
        .gsap-room-card:focus-visible {
          border-color: #c9fe6e;
          outline: none;
        }

        .card-image-wrapper {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
        }

        .card-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 500ms cubic-bezier(0.33, 1, 0.68, 1);
        }

        .gsap-room-card:hover .card-image-wrapper img,
        .gsap-room-card:focus-visible .card-image-wrapper img {
          transform: scale(1.08);
        }

        .card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.8));
          opacity: 0.5;
          transition: opacity 300ms ease;
        }

        .gsap-room-card:hover .card-overlay,
        .gsap-room-card:focus-visible .card-overlay {
          opacity: 0.8;
        }

        .card-number {
          position: absolute;
          top: 14px; /* space.4 */
          right: 14px;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
          padding: 6px 10px;
          border-radius: 100px; /* radius.lg */
          font-size: 11px; /* font.size.xs */
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .card-content {
          padding: 1.25rem; /* space.8 = 20px */
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: #0a0a0b;
          position: relative;
          z-index: 2;
        }

        .card-content strong {
          font-size: 18px; /* font.size.lg */
          font-weight: 500;
          line-height: 1.2;
        }

        .card-content em {
          font-size: 12px; /* font.size.sm */
          font-style: normal;
          color: #999999;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 200ms ease; /* motion.duration.fast */
        }

        .card-content em span {
          transition: transform 200ms ease;
        }

        .gsap-room-card:hover .card-content em,
        .gsap-room-card:focus-visible .card-content em {
          color: #c9fe6e;
        }

        .gsap-room-card:hover .card-content em span,
        .gsap-room-card:focus-visible .card-content em span {
          transform: translateX(4px);
        }

        @media (min-width: 1024px) {
          .gsap-container {
            flex-direction: row;
            align-items: flex-start;
          }

          .gsap-header {
            position: sticky;
            top: 120px;
            flex: 0 0 300px;
          }

          .gsap-grid {
            flex: 1;
            /* Create a staggered/masonry look by offsetting even columns */
            align-items: flex-start;
          }

          .gsap-room-card:nth-child(even) {
            margin-top: 4rem;
          }
        }

        @media (max-width: 768px) {
          .shop-room-gsap-section {
            padding: 4rem 1.25rem;
          }
          .gsap-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 480px) {
          .gsap-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
