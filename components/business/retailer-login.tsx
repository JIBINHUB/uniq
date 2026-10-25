"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Check, Eye, EyeOff, Layers3, LockKeyhole, MessageCircle, Store } from "lucide-react";
import { browserSupabase } from "@/lib/supabase/client";
import { RetailerFooter } from "./retailer-shell";

export function RetailerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { error } = await browserSupabase().auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw new Error("Unable to sign in. Check your email, password and email verification.");
      window.location.assign("/retailers/shop");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="account-page retailer-account-landing">
      <header className="account-header">
        <Link href="/" aria-label="UNIQ FLOORS home"><img src="/assets/brand/uniq-header-logo.png" alt="UNIQ FLOORS" /></Link>
        <Link href="/shop">Explore floors <ArrowUpRight size={17} /></Link>
      </header>

      <div className="account-layout">
        <section className="account-story" aria-label="UNIQ FLOORS retailer introduction">
          <div className="account-story-photo" aria-hidden="true" />
          <div className="account-story-copy">
            <h1>Better flooring. Built around your business.</h1>
            <p>A considered collection, clear specifications and direct support for every project.</p>
            <div className="account-story-notes">
              <span><Layers3 size={18} /> Curated trade collection</span>
              <span><Check size={18} /> Dedicated project support</span>
            </div>
          </div>
        </section>

        <section className="account-panel" id="retailer-access" aria-labelledby="retailer-login-title">
          <div className="account-panel-inner">
            <div className="account-panel-mark"><Store size={24} /></div>
            <h2 id="retailer-login-title">Your trade space.</h2>
            <p className="account-panel-lede">Sign in with your approved retailer account to explore flooring for your next project.</p>

            <form onSubmit={signIn}>
              <label htmlFor="retailer-email">Email address</label>
              <input id="retailer-email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} placeholder="you@yourbusiness.co.uk" />
              <label htmlFor="retailer-password">Password</label>
              <div className="account-password-field">
                <input id="retailer-password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
              </div>
              <p className="account-message" role="status">{message}</p>
              <button className="account-submit" type="submit" disabled={busy}>
                <span>{busy ? "Signing in…" : "Sign in to trade"}</span><ArrowUpRight size={20} />
              </button>
            </form>
            <Link className="account-secondary-action" href="/retailers/register">Apply for a retailer account <ArrowUpRight size={15} /></Link>
            <Link className="retailer-account-browse" href="/retailers/shop">Explore the trade collection <ArrowRight size={16} /></Link>
            <div className="account-secure-note"><LockKeyhole size={15} /> Secure sign in powered by UNIQ FLOORS</div>
          </div>
        </section>
      </div>

      <section className="retailer-account-benefits" aria-label="Why work with UNIQ FLOORS">
        <article><Layers3 size={25} /><h3>A focused collection</h3><p>Compare materials and finishes with confidence.</p></article>
        <article><MessageCircle size={25} /><h3>Direct project support</h3><p>Discuss specifications and selections with our team.</p></article>
        <article><BriefcaseBusiness size={25} /><h3>One business space</h3><p>Keep projects, selections and support together.</p></article>
      </section>
      <div className="retailer-page retailer-account-footer"><RetailerFooter /></div>
    </main>
  );
}
