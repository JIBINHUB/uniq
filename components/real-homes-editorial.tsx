"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Star } from "lucide-react";
import { useState } from "react";

const homes = [
  {
    name: "Sophie B.", location: "York, North Yorkshire", city: "York", mapX: 175, mapY: 285,
    quote: "We wanted an oak floor with genuine character, but nothing that felt too formal. The warm grain has made the sitting room feel settled, comfortable and properly finished.",
    image: "/assets/real/real-home-york-oak.jpg", product: "Ashford Natural Oak Brushed", finish: "Warm character oak", href: "/product/ashford-natural-oak-engineered",
  },
  {
    name: "Oliver H.", location: "Didsbury, Manchester", city: "Manchester", mapX: 139, mapY: 318,
    quote: "The smoked boards gave the room exactly the depth we were hoping for. They work beautifully with the darker walls, and the wider plank makes the whole space feel calmer.",
    image: "/assets/real/real-home-manchester-smoked.jpg", product: "Kensington Smoked Oak Wide Plank", finish: "Deep smoked oak", href: "/product/kensington-smoked-oak-engineered",
  },
  {
    name: "Amelia C.", location: "Clerkenwell, London", city: "London", mapX: 198, mapY: 400,
    quote: "We needed a light floor that would soften the concrete and keep the natural light moving through the flat. The pale oak feels understated, modern and very easy to live with.",
    image: "/assets/real/real-home-london-white-oak.jpg", product: "Brighton White Oak Matt", finish: "Pale contemporary oak", href: "/product/brighton-white-oak-engineered",
  },
] as const;

export function RealHomesEditorial() {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = homes[activeIndex];

  return (
    <section className="section real-homes-section homes-editorial" aria-labelledby="homes-editorial-title">
      <div className="homes-editorial-inner">
        <div className="homes-editorial-heading">
          <h2 id="homes-editorial-title">What our customers say about us.</h2>
          <p>Honest notes from homes living with UNIQ floors.</p>
        </div>
        <div className="homes-editorial-switcher" role="group" aria-label="Choose a customer home">
          {homes.map((home, index) => (
            <button type="button" className={index === activeIndex ? "is-active" : ""} aria-pressed={index === activeIndex} onClick={() => setActiveIndex(index)} key={home.city}>
              <span aria-hidden="true">{home.name.slice(0, 1)}</span>{home.city}
            </button>
          ))}
        </div>

        <div className="homes-editorial-layout">
          <div className="homes-editorial-story" aria-live="polite">
            <div className="homes-editorial-person">
              <span className="homes-editorial-person-mark">{active.name.slice(0, 1)}</span>
              <span><strong>{active.name}</strong><small>{active.location}</small></span>
            </div>
            <blockquote key={active.name}>“{active.quote}”</blockquote>
            <span className="homes-editorial-rating"><Star size={16} fill="currentColor" aria-hidden="true" /> 5.0 / 5</span>
          </div>

          <div className="homes-editorial-map">
            <div className="homes-editorial-map-top"><MapPin size={17} aria-hidden="true" /><span>From our homes to yours</span></div>
            <div className="homes-editorial-map-visual" role="img" aria-label={`Illustrated map of the United Kingdom highlighting ${active.city}`}>
              <svg viewBox="0 0 320 490" aria-hidden="true" focusable="false">
                <defs>
                  <pattern id="homes-map-dots" width="6" height="6" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.25" fill="#dda88e" />
                  </pattern>
                  <clipPath id="homes-map-photo-mask"><circle r="15" /></clipPath>
                </defs>
                <path className="homes-map-land" d="M152 19 168 30 174 43 188 47 186 61 199 71 185 84 192 97 179 105 191 122 180 137 185 149 171 160 173 178 164 190 182 199 191 216 184 232 193 249 183 266 190 281 181 292 184 307 174 320 183 333 175 347 186 360 184 374 204 385 209 400 227 412 224 426 210 430 192 422 179 428 165 439 146 438 129 448 112 445 94 452 75 450 62 462 43 459 38 451 55 440 69 432 80 417 96 410 109 398 117 381 126 371 121 355 130 342 124 327 134 311 129 297 140 282 132 267 143 253 136 235 147 223 139 211 149 196 140 185 147 169 136 155 148 143 140 131 152 118 146 103 156 91 149 77 159 63 150 52 155 39 146 29Z" />
                <path className="homes-map-land homes-map-island" d="M57 289 70 282 80 289 88 301 82 311 87 325 76 338 62 336 51 344 38 335 37 320 44 309 41 298Z" />
                {homes.map((home, index) => (
                  <g key={home.city} className={`homes-map-point homes-map-point-${index}${index === activeIndex ? " is-active" : ""}`} transform={`translate(${home.mapX} ${home.mapY})`}>
                    <circle className="homes-map-halo" r="20" />
                    <image href={home.image} x="-15" y="-15" width="30" height="30" preserveAspectRatio="xMidYMid slice" clipPath="url(#homes-map-photo-mask)" />
                    <circle className="homes-map-photo-ring" r="15" />
                    <circle className="homes-map-location-dot" cx="14" cy="15" r="5" />
                    <text x="24" y="4">{home.city}</text>
                  </g>
                ))}
              </svg>
              <span className="homes-map-caption">REAL HOMES <span>•</span> ACROSS THE UK</span>
            </div>
          </div>

          <Link className="homes-editorial-feature" href={active.href} aria-label={`Explore ${active.product}`}>
            <Image key={active.image} src={active.image} alt={`${active.finish} flooring in a ${active.location} home`} fill sizes="(max-width: 760px) 100vw, 55vw" />
            <span className="homes-editorial-feature-content">
              <span className="homes-editorial-feature-top"><span>THE HOME EDIT</span><span>{active.city.toUpperCase()}</span></span>
              <span className="homes-editorial-feature-bottom">
                <span className="homes-editorial-feature-label">{active.finish}</span>
                <strong>{active.product}</strong>
                <span className="homes-editorial-feature-button">Explore this floor <ArrowUpRight size={18} aria-hidden="true" /></span>
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
