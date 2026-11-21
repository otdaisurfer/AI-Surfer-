import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CREW_AGENTS } from "../../crew/catalog";
import { hasCrewAccess } from "../../crew/entitlements";
import type { MembershipTier } from "../../crew/types";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "./crew-deck.css";

type BusinessProfile = {
  business_name: string;
  website: string;
  industry: string;
  location: string;
  products_services: string;
  ideal_customer: string;
  primary_offers: string;
  brand_voice: string;
  business_goals: string;
  reply_to_email: string;
};

const emptyProfile: BusinessProfile = {
  business_name: "",
  website: "",
  industry: "",
  location: "",
  products_services: "",
  ideal_customer: "",
  primary_offers: "",
  brand_voice: "",
  business_goals: "",
  reply_to_email: "",
};

export default function CrewDeck() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tier, setTier] = useState<MembershipTier>(
    user?.app_metadata?.role === "owner" ? "Owner" : "Member",
  );
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [draft, setDraft] = useState<BusinessProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!user) return;

    async function load() {
      const [profileResult, tierResult] = await Promise.all([
        supabase
          .from("business_profiles")
          .select("business_name,website,industry,location,products_services,ideal_customer,primary_offers,brand_voice,business_goals,reply_to_email")
          .eq("auth_id", user.id)
          .maybeSingle(),
        user.app_metadata?.role === "owner"
          ? Promise.resolve({ data: { tier: "Owner" } })
          : supabase
              .from("users")
              .select("tier")
              .eq("auth_id", user.id)
              .maybeSingle(),
      ]);

      if (!active) return;
      if (tierResult.data?.tier) {
        setTier(tierResult.data.tier as MembershipTier);
      }
      if (profileResult.data) {
        const loaded = profileResult.data as BusinessProfile;
        setProfile(loaded);
        setDraft(loaded);
      }
      setLoading(false);
    }

    void load();
    return () => {
      active = false;
    };
  }, [user]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    setError("");

    const normalized = {
      ...draft,
      website: /^https?:\/\//i.test(draft.website)
        ? draft.website
        : `https://${draft.website}`,
      reply_to_email: draft.reply_to_email || user.email || "",
    };

    const { data, error: saveError } = await supabase
      .from("business_profiles")
      .upsert(
        { auth_id: user.id, ...normalized, updated_at: new Date().toISOString() },
        { onConflict: "auth_id" },
      )
      .select("business_name,website,industry,location,products_services,ideal_customer,primary_offers,brand_voice,business_goals,reply_to_email")
      .single();

    if (saveError || !data) {
      setError("We couldn't save your business profile yet. Your answers are still here.");
    } else {
      setProfile(data as BusinessProfile);
      setDraft(data as BusinessProfile);
      setEditing(false);
    }
    setSaving(false);
  }

  if (loading) {
    return <main className="crew-page"><p className="crew-loading">🌊 Preparing your Crew Deck…</p></main>;
  }

  if (!profile || editing) {
    return (
      <main className="crew-page">
        <section className="crew-profile-shell">
          <p className="crew-kicker">ONE BUSINESS · SIX SPECIALISTS</p>
          <h1>{profile ? "Update your business profile" : "Teach the crew about your business."}</h1>
          <p className="crew-intro">This shared profile keeps every specialist grounded in the same facts, voice, offers, and goals.</p>
          <form className="crew-profile-form" onSubmit={saveProfile}>
            <label>Business name<input required minLength={2} value={draft.business_name} onChange={(event) => setDraft({ ...draft, business_name: event.target.value })} /></label>
            <label>Website<input required inputMode="url" placeholder="https://yourbusiness.com" value={draft.website} onChange={(event) => setDraft({ ...draft, website: event.target.value })} /></label>
            <label>Industry<input required minLength={2} value={draft.industry} onChange={(event) => setDraft({ ...draft, industry: event.target.value })} /></label>
            <label>Location<input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} /></label>
            <label className="crew-wide">Products or services<textarea required value={draft.products_services} onChange={(event) => setDraft({ ...draft, products_services: event.target.value })} /></label>
            <label className="crew-wide">Ideal customer<textarea required value={draft.ideal_customer} onChange={(event) => setDraft({ ...draft, ideal_customer: event.target.value })} /></label>
            <label className="crew-wide">Primary offers<textarea value={draft.primary_offers} onChange={(event) => setDraft({ ...draft, primary_offers: event.target.value })} /></label>
            <label>Brand voice<input placeholder="Warm, direct, professional…" value={draft.brand_voice} onChange={(event) => setDraft({ ...draft, brand_voice: event.target.value })} /></label>
            <label>Reply-to email<input required type="email" value={draft.reply_to_email || user?.email || ""} onChange={(event) => setDraft({ ...draft, reply_to_email: event.target.value })} /></label>
            <label className="crew-wide">Business goals<textarea required value={draft.business_goals} onChange={(event) => setDraft({ ...draft, business_goals: event.target.value })} /></label>
            {error && <p className="crew-error crew-wide" role="alert">{error}</p>}
            <div className="crew-form-actions crew-wide">
              {profile && <button type="button" className="crew-button crew-button-secondary" onClick={() => { setDraft(profile); setEditing(false); }}>Cancel</button>}
              <button className="crew-button" disabled={saving}>{saving ? "Saving…" : "Save & Enter Crew Deck →"}</button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="crew-page">
      <header className="crew-hero">
        <div>
          <p className="crew-kicker">AI SURFER CREW DECK</p>
          <h1>Your whole AI crew. One shared business brain.</h1>
          <p className="crew-intro">{profile.business_name} · <strong>{tier}</strong></p>
        </div>
        <button className="crew-button crew-button-secondary" onClick={() => setEditing(true)}>Edit business profile</button>
      </header>

      <section className="crew-status-row" aria-label="Crew status">
        <div><strong>6</strong><span>Specialists aboard</span></div>
        <div><strong>{CREW_AGENTS.filter((agent) => hasCrewAccess(tier, agent.slug)).length}</strong><span>Unlocked for your plan</span></div>
        <div><strong>Approval</strong><span>Required before email</span></div>
      </section>

      <section>
        <div className="crew-section-heading">
          <div><p className="crew-kicker">CHOOSE YOUR SPECIALIST</p><h2>Who is catching this wave?</h2></div>
        </div>
        <div className="crew-grid">
          {CREW_AGENTS.map((agent) => {
            const unlocked = hasCrewAccess(tier, agent.slug);
            return (
              <article className={`crew-card ${unlocked ? "" : "crew-card-locked"}`} key={agent.slug}>
                <div className="crew-card-top"><span className="crew-icon">{agent.icon}</span><span className="crew-access">{unlocked ? "READY" : agent.minimumTier}</span></div>
                <h3>{agent.name}</h3>
                <p>{agent.description}</p>
                <button
                  className="crew-button"
                  onClick={() => navigate(unlocked ? `/members/crew/${agent.slug}` : "/pricing")}
                >
                  {unlocked ? "Open workspace →" : "View upgrade →"}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
