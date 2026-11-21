import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { crewAgentBySlug } from "../../crew/catalog";
import { hasCrewAccess } from "../../crew/entitlements";
import type { MembershipTier } from "../../crew/types";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import EmailDraftPanel from "../../components/crew/EmailDraftPanel";
import "./crew-deck.css";

type Activity = { message: string; status: "running" | "done" };

function collectSources(output: string): string[] {
  return Array.from(
    new Set(output.match(/https?:\/\/[^\s)\]}>"']+/g) ?? []),
  );
}

export default function AgentWorkspace() {
  const { agentSlug = "" } = useParams();
  const navigate = useNavigate();
  const { user, session } = useAuth();
  const agent = crewAgentBySlug(agentSlug);
  const [tier, setTier] = useState<MembershipTier>(
    user?.app_metadata?.role === "owner" ? "Owner" : "Member",
  );
  const [projectId, setProjectId] = useState("");
  const [task, setTask] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sources = useMemo(() => collectSources(output), [output]);

  useEffect(() => {
    let active = true;
    if (!user || !agent) return;

    async function prepare() {
      const tierPromise =
        user.app_metadata?.role === "owner"
          ? Promise.resolve({ data: { tier: "Owner" } })
          : supabase
              .from("users")
              .select("tier")
              .eq("auth_id", user.id)
              .maybeSingle();

      const [tierResult, profileResult] = await Promise.all([
        tierPromise,
        supabase
          .from("business_profiles")
          .select("id")
          .eq("auth_id", user.id)
          .maybeSingle(),
      ]);

      if (!active) return;
      const resolvedTier = (tierResult.data?.tier || "Member") as MembershipTier;
      setTier(resolvedTier);

      if (!profileResult.data?.id) {
        setError("Complete your business profile before starting the crew.");
        setLoading(false);
        return;
      }

      const existing = await supabase
        .from("crew_projects")
        .select("id")
        .eq("auth_id", user.id)
        .eq("agent_slug", agent.slug)
        .eq("status", "active")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!active) return;
      if (existing.data?.id) {
        setProjectId(existing.data.id);
      } else {
        const created = await supabase
          .from("crew_projects")
          .insert({
            auth_id: user.id,
            business_profile_id: profileResult.data.id,
            agent_slug: agent.slug,
            title: `${agent.name} workspace`,
          })
          .select("id")
          .single();

        if (created.data?.id) setProjectId(created.data.id);
        else setError("We couldn't prepare this workspace yet.");
      }
      setLoading(false);
    }

    void prepare();
    return () => {
      active = false;
    };
  }, [agent, user]);

  if (!agent) {
    return (
      <main className="crew-page">
        <section className="crew-panel">
          <h1>Specialist not found</h1>
          <button className="crew-button" onClick={() => navigate("/members/crew")}>Back to Crew Deck</button>
        </section>
      </main>
    );
  }

  const unlocked = hasCrewAccess(tier, agent.slug);

  async function runTask() {
    if (!session?.access_token || !projectId || task.trim().length < 10) return;
    setBusy(true);
    setError("");
    setOutput("");
    setActivities([{ message: `${agent.name} is entering the water…`, status: "running" }]);

    try {
      const response = await fetch("/api/crew/run", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentSlug: agent.slug,
          projectId,
          task: task.trim(),
        }),
      });

      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "The Crew Engine could not start.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() || "";

        for (const chunk of chunks) {
          const line = chunk.split("\n").find((item) => item.startsWith("data: "));
          if (!line) continue;
          const event = JSON.parse(line.slice(6));

          if (event.type === "text_delta") {
            setOutput((current) => current + event.delta);
          } else if (event.type === "tool_progress") {
            setActivities((current) => {
              const completed = current.map((item) => ({ ...item, status: "done" as const }));
              return [...completed, { message: event.message, status: event.status === "completed" ? "done" : "running" }];
            });
          } else if (event.type === "final") {
            setOutput(event.output);
            setActivities((current) => current.map((item) => ({ ...item, status: "done" as const })));
          } else if (event.type === "error") {
            throw new Error(event.message);
          }
        }
      }
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "The Crew Engine could not finish this task.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <main className="crew-page"><p className="crew-loading">🌊 Preparing {agent.name}…</p></main>;
  }

  if (!unlocked) {
    return (
      <main className="crew-page">
        <section className="crew-panel">
          <p className="crew-kicker">UPGRADE REQUIRED</p>
          <h1>Catch this wave with {agent.minimumTier}.</h1>
          <p className="crew-intro">Your current membership is <strong>{tier}</strong>.</p>
          <button className="crew-button" onClick={() => navigate("/pricing")}>View Plans 💳</button>
        </section>
      </main>
    );
  }

  if (!projectId) {
    return (
      <main className="crew-page">
        <section className="crew-panel">
          <p className="crew-error" role="alert">{error || "This workspace is not ready yet."}</p>
          <button className="crew-button" onClick={() => navigate("/members/crew")}>Return to Crew Deck</button>
        </section>
      </main>
    );
  }

  return (
    <main className="crew-page">
      <header className="crew-hero">
        <div>
          <button className="crew-button crew-button-secondary" onClick={() => navigate("/members/crew")}>← Crew Deck</button>
          <p className="crew-kicker" style={{ marginTop: 22 }}>AI SURFER SPECIALIST</p>
          <h1>{agent.icon} {agent.name}</h1>
          <p className="crew-intro">{agent.description}</p>
        </div>
        <span className="crew-access">{tier} · READY</span>
      </header>

      <div className="crew-workspace">
        <section className="crew-panel">
          <p className="crew-kicker">START A TASK</p>
          <div className="crew-starters">
            {agent.guidedStarters.map((starter) => (
              <button className="crew-starter" key={starter} onClick={() => setTask(starter)}>{starter}</button>
            ))}
          </div>
          <label>
            <span className="crew-kicker">YOUR REQUEST</span>
            <textarea className="crew-task-input" value={task} onChange={(event) => setTask(event.target.value)} placeholder={`Tell ${agent.name} what your business needs…`} />
          </label>
          <button className="crew-button" disabled={busy || task.trim().length < 10} onClick={runTask} style={{ width: "100%", marginTop: 14 }}>
            {busy ? "Riding the wave…" : `Run ${agent.name} →`}
          </button>
          {activities.length > 0 && (
            <div className="crew-activity" aria-live="polite">
              {activities.map((activity, index) => <span key={`${activity.message}-${index}`}>{activity.status === "done" ? "✓" : "◌"} {activity.message}</span>)}
            </div>
          )}
          {error && <p className="crew-error" role="alert">{error}</p>}
        </section>

        <section className="crew-panel">
          <p className="crew-kicker">LIVE CREW OUTPUT</p>
          <div className="crew-output" aria-live="polite">
            {output || "Your sourced findings and ready-to-use work will appear here."}
          </div>
          {sources.length > 0 && (
            <div className="crew-sources">
              <strong>Research sources</strong>
              {sources.map((source) => <a key={source} href={source} target="_blank" rel="noreferrer">{source}</a>)}
            </div>
          )}
          {output && <EmailDraftPanel projectId={projectId} agentSlug={agent.slug} output={output} />}
        </section>
      </div>
    </main>
  );
}
