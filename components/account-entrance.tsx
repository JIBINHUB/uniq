"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, Eye, EyeOff, Layers3, LockKeyhole, UserRound } from "lucide-react";
import { browserSupabase } from "@/lib/supabase/client";

type Audience = "customer" | "retailer";

export function AccountEntrance() {
  const [audience, setAudience] = useState<Audience>("customer");
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [signedInEmail, setSignedInEmail] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    try {
      void browserSupabase().auth.getUser().then(({ data }) => {
        if (alive) setSignedInEmail(data.user?.email ?? null);
      });
    } catch { /* The form will show a configuration error on submit. */ }
    return () => { alive = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const auth = browserSupabase().auth;
      if (register && audience === "customer") {
        const { data, error } = await auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/account` },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage("Check your email to verify your account, then return here to sign in.");
          return;
        }
        setSignedInEmail(data.user?.email ?? email.trim());
        setMessage("Your account is ready.");
        return;
      }
      const { data, error } = await auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (!data.user.email_confirmed_at) {
        await auth.signOut();
        setMessage("Verify your email before signing in.");
        return;
      }
      if (audience === "retailer") {
        window.location.assign("/retailers/shop");
      } else {
        setSignedInEmail(data.user.email ?? email.trim());
        setMessage("Welcome back.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sign in is unavailable. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    try {
      const { error } = await browserSupabase().auth.signOut();
      if (error) throw error;
      setSignedInEmail(null);
      setPassword("");
      setMessage("You have signed out.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign out.");
    } finally { setBusy(false); }
  }

  function selectAudience(next: Audience) {
    setAudience(next);
    setRegister(false);
    setMessage("");
  }

  return <main className="account-page">
    <header className="account-header">
      <Link href="/" aria-label="UNIQ FLOORS home"><img src="/assets/brand/uniq-header-logo.png" alt="UNIQ FLOORS" /></Link>
      <Link href="/shop">Explore floors <ArrowUpRight size={17}/></Link>
    </header>
    <div className="account-layout">
      <section className="account-story" aria-label="UNIQ FLOORS account introduction">
        <div className="account-story-photo" aria-hidden="true" />
        <div className="account-story-copy">
          <h1>Floors for every chapter of living.</h1>
          <p>Step into a space for considered choices, helpful advice and the details that make a room feel yours.</p>
          <div className="account-story-notes"><span><Layers3 size={18}/> Considered collections</span><span><Check size={18}/> Real flooring support</span></div>
        </div>
      </section>
      <section className="account-panel" aria-labelledby="account-title">
        <div className="account-panel-inner">
          <div className="account-panel-mark"><UserRound size={24}/></div>
          <h2 id="account-title">{signedInEmail ? "Good to have you here." : register ? "Create your account." : "Welcome back."}</h2>
          <p className="account-panel-lede">{signedInEmail ? "Your account is ready whenever you are." : "Choose how you shop, then continue with your email."}</p>

          {signedInEmail ? <div className="account-signed-in">
            <span><Check size={19}/> Signed in</span>
            <strong>{signedInEmail}</strong>
            <div><Link href="/shop">Browse floors <ArrowRight size={17}/></Link><Link href="/retailers/shop">Retailer space <ArrowRight size={17}/></Link></div>
            <button type="button" disabled={busy} onClick={() => void signOut()}>Sign out</button>
          </div> : <>
            <div className="account-audience" role="group" aria-label="Account type">
              <button type="button" aria-pressed={audience === "customer"} onClick={() => selectAudience("customer")}><UserRound size={18}/> For your home</button>
              <button type="button" aria-pressed={audience === "retailer"} onClick={() => selectAudience("retailer")}><Layers3 size={18}/> Retailer</button>
            </div>
            <p className="account-audience-note">{audience === "retailer" ? "Sign in with your approved trade account. New retailers can apply below." : "Sign in for a more personal way to choose flooring."}</p>
            <form onSubmit={submit}>
              <label htmlFor="account-email">Email address</label>
              <input id="account-email" type="email" required maxLength={254} autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" />
              <label htmlFor="account-password">Password</label>
              <div className="account-password-field"><input id="account-password" type={showPassword ? "text" : "password"} required minLength={register ? 8 : 1} autoComplete={register ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" /><button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div>
              <p className="account-message" role="status">{message}</p>
              <button className="account-submit" type="submit" disabled={busy}><span>{busy ? "Please wait…" : audience === "retailer" ? "Sign in to trade" : register ? "Create account" : "Sign in"}</span><ArrowUpRight size={20}/></button>
            </form>
            {audience === "customer" ? <button className="account-secondary-action" type="button" onClick={() => {setRegister(value => !value); setMessage("");}}>{register ? "Already have an account? Sign in" : "New here? Create an account"}</button> : <Link className="account-secondary-action" href="/retailers/register">Apply for a retailer account <ArrowUpRight size={15}/></Link>}
          </>}
          <div className="account-secure-note"><LockKeyhole size={15}/> Secure sign in powered by UNIQ FLOORS</div>
        </div>
      </section>
    </div>
  </main>;
}
