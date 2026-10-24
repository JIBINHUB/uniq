"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  Layers3,
  MessageCircle,
  Store,
} from "lucide-react";
import { browserSupabase } from "@/lib/supabase/client";
import { RetailerHeader, RetailerFooter } from "./retailer-shell";

export function RetailerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { error } = await browserSupabase().auth.signInWithPassword({ email, password });
      if (error) throw new Error("Unable to sign in. Check your email, password and email verification.");
      window.location.assign("/retailers/shop");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="retailer-page retailer-matcha-page">
      <RetailerHeader />

      <section className="retailer-matcha-hero">
        <div className="retailer-matcha-copy">
          <p className="retailer-kicker">UNIQ FLOORS · TRADE PARTNERS</p>
          <h1>Better flooring.<br />Built around your business.</h1>
          <p>Explore a considered collection, create trade selections and keep every conversation with our flooring team in one clear place.</p>
          <div className="retailer-matcha-actions">
            <Link className="retailer-dark-button" href="/retailers/shop">Browse wholesale shop <ArrowUpRight size={17} /></Link>
            <a className="retailer-blue-link" href="#retailer-access">Retailer account <ArrowDown size={17} /></a>
            <Link className="retailer-blue-link" href="/retailers/register">Become a retailer <ArrowUpRight size={17} /></Link>
          </div>
        </div>
        <div className="retailer-matcha-visual">
          <img src="/assets/real/living-oak.jpg" alt="Natural oak flooring in a considered living space" />
          <div className="retailer-visual-note">
            <span>TRADE COLLECTION</span>
            <strong>Floors selected for real projects.</strong>
            <small>Samples · specifications · direct support</small>
          </div>
        </div>
      </section>

      <section className="retailer-benefit-strip" aria-label="Retailer benefits">
        <article><span><Layers3 /></span><div><strong>A focused collection</strong><small>Compare materials and finishes quickly.</small></div></article>
        <article><span><MessageCircle /></span><div><strong>Direct project support</strong><small>Discuss every selection with our team.</small></div></article>
        <article><span><BriefcaseBusiness /></span><div><strong>One business space</strong><small>Your projects, selections and support together.</small></div></article>
      </section>

      <section className="retailer-access-section" id="retailer-access">
        <div className="retailer-access-heading">
          <p className="retailer-kicker">RETAILER ACCESS</p>
          <h2>Your trade space.</h2>
          <p>Sign in with your approved business account to browse the trade collection and build your next flooring selection.</p>
        </div>

        <div className="retailer-access-frame">
          <aside className="retailer-access-story">
            <span className="retailer-access-icon" aria-hidden="true"><Store /></span>
            <p className="retailer-kicker">RETAILER ACCOUNT</p>
            <h3>Your next project starts here.</h3>
            <p>Build a flooring selection and open a direct trade conversation with UNIQ FLOORS.</p>
            <ul>
              <li><span>01</span>Approved trade access</li>
              <li><span>02</span>Dedicated product catalogue</li>
              <li><span>03</span>WhatsApp order support</li>
            </ul>
          </aside>

          <section className="retailer-form-panel retailer-access-card">
            <p className="retailer-kicker">WELCOME BACK</p>
            <h2>Retailer sign in</h2>
            <p>Use your verified business account. Retailer approval is required.</p>
            <form onSubmit={signIn}>
              <div className="retailer-fields retailer-login-fields">
                <label>Email address<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} /></label>
                <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} /></label>
              </div>
              <p className="retailer-form-message" role="status">{message}</p>
              <button className="retailer-button" disabled={busy}>{busy ? "Signing in…" : "Open retailer shop"}<ArrowUpRight size={17} /></button>
            </form>
            <div className="retailer-apply-prompt"><p>New to UNIQ FLOORS?</p><Link href="/retailers/register">Apply for a retailer account <ArrowUpRight size={17} /></Link></div>
          </section>
        </div>
      </section>

      <RetailerFooter />
    </main>
  );
}
