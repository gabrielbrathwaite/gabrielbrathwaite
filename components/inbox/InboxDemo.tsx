"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import {
  ROUTES,
  ROUTE_ORDER,
  SEED_EMAILS,
  URGENCY_LABEL,
  type CrmRecord,
  type Intent,
  type SeedEmail,
} from "@/lib/inboxDemo";

/**
 * <InboxDemo> — the live, interactive Inbox-to-CRM pipeline.
 *
 *   Left:   the seeded messy inbox. Click an email (or "Process all").
 *   Right:  before / after for the selected email — raw text next to the
 *           structured CRM record the pipeline extracted.
 *   Below:  a mock CRM that fills up as records are created, grouped and
 *           colour-coded by routing destination.
 *
 * Extraction goes through POST /api/extract, which uses Claude server-side and
 * falls back to a pre-computed record when there's no key / the limit is hit —
 * so this component never has to special-case "the demo is broken".
 */

type Status = "idle" | "processing" | "done" | "error";
type Source = "live" | "fallback" | "rate-limited";

type EmailState = {
  status: Status;
  record?: CrmRecord;
  source?: Source;
};

export function InboxDemo() {
  const [states, setStates] = useState<Record<string, EmailState>>(() =>
    Object.fromEntries(SEED_EMAILS.map((e) => [e.id, { status: "idle" as Status }]))
  );
  const [selectedId, setSelectedId] = useState<string>(SEED_EMAILS[0].id);
  const [bulkRunning, setBulkRunning] = useState(false);

  const selected = SEED_EMAILS.find((e) => e.id === selectedId)!;
  const selectedState = states[selectedId];

  // Records that have been created, in the order they were processed → CRM table.
  const created = useMemo(
    () =>
      SEED_EMAILS.map((e) => ({ email: e, state: states[e.id] })).filter(
        (x) => x.state.record
      ),
    [states]
  );

  async function processEmail(email: SeedEmail) {
    setStates((s) => ({ ...s, [email.id]: { ...s[email.id], status: "processing" } }));
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: email.id }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { record: CrmRecord; source: Source };
      setStates((s) => ({
        ...s,
        [email.id]: { status: "done", record: data.record, source: data.source },
      }));
    } catch {
      setStates((s) => ({ ...s, [email.id]: { ...s[email.id], status: "error" } }));
    }
  }

  async function processAll() {
    setBulkRunning(true);
    // Sequential so the CRM table fills visibly, one routed record at a time.
    for (const email of SEED_EMAILS) {
      if (states[email.id].record) continue;
      setSelectedId(email.id);
      await processEmail(email);
    }
    setBulkRunning(false);
  }

  function reset() {
    setStates(
      Object.fromEntries(SEED_EMAILS.map((e) => [e.id, { status: "idle" as Status }]))
    );
    setSelectedId(SEED_EMAILS[0].id);
  }

  const processedCount = created.length;

  return (
    <div className="space-y-10">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted">
          <span className="font-mono text-ink">{processedCount}</span> of{" "}
          <span className="font-mono text-ink">{SEED_EMAILS.length}</span> emails
          routed into the CRM.
        </p>
        <div className="flex gap-2">
          <Button size="sm" onClick={processAll} disabled={bulkRunning}>
            {bulkRunning ? "Processing…" : "Process all"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={reset}
            disabled={bulkRunning || processedCount === 0}
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Inbox (left) + before/after (right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* LEFT — the messy inbox */}
        <div className="rounded-2xl border border-border bg-surface">
          <div className="border-b border-border px-4 py-3">
            <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
              Inbound — raw inbox
            </h3>
          </div>
          <ul className="divide-y divide-border">
            {SEED_EMAILS.map((email) => {
              const st = states[email.id];
              const active = email.id === selectedId;
              return (
                <li key={email.id}>
                  <button
                    onClick={() => setSelectedId(email.id)}
                    aria-current={active}
                    className={cn(
                      "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors",
                      active ? "bg-surface-2" : "hover:bg-surface-2/60"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-ink">
                        {senderName(email.from)}
                      </span>
                      <span className="shrink-0 font-mono text-[11px] text-faint">
                        {email.receivedAt}
                      </span>
                    </div>
                    <span className="truncate text-sm text-muted">
                      {email.subject}
                    </span>
                    <StatusPill state={st} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* RIGHT — before / after for the selected email */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* BEFORE — raw email */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
                Before — raw email
              </h3>
            </div>
            <div className="flex-1 space-y-3 p-4">
              <dl className="space-y-1 text-sm">
                <Row label="From" value={selected.from} />
                <Row label="Subject" value={selected.subject} />
              </dl>
              <p className="whitespace-pre-wrap border-t border-border pt-3 text-sm leading-relaxed text-muted">
                {selected.body}
              </p>
            </div>
            <div className="border-t border-border p-4">
              <Button
                size="sm"
                className="w-full"
                onClick={() => processEmail(selected)}
                disabled={selectedState.status === "processing" || bulkRunning}
              >
                {selectedState.status === "processing"
                  ? "Extracting…"
                  : selectedState.record
                    ? "Re-process"
                    : "Process this email →"}
              </Button>
            </div>
          </div>

          {/* AFTER — structured record */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-mono text-xs uppercase tracking-[0.15em] text-faint">
                After — CRM record
              </h3>
              {selectedState.source && <SourceBadge source={selectedState.source} />}
            </div>
            <div className="flex-1 p-4">
              {selectedState.status === "processing" ? (
                <RecordSkeleton />
              ) : selectedState.record ? (
                <RecordView record={selectedState.record} />
              ) : selectedState.status === "error" ? (
                <Empty>
                  Something went wrong extracting this one. Try again.
                </Empty>
              ) : (
                <Empty>
                  Hit{" "}
                  <span className="font-medium text-ink">Process this email</span>{" "}
                  to extract a structured record.
                </Empty>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CRM (below) — fills up as records are created, grouped by destination */}
      <CrmBoard
        created={created}
        onSelect={(id) => setSelectedId(id)}
        selectedId={selectedId}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Right-panel: the extracted record
// ---------------------------------------------------------------------------
function RecordView({ record }: { record: CrmRecord }) {
  const route = ROUTES[record.intent];
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <IntentChip intent={record.intent} />
        <UrgencyChip urgency={record.urgency} />
      </div>

      <dl className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
        <Field label="Contact" value={record.contactName} />
        <Field label="Company" value={record.company} />
        <Field label="Email" value={record.email} mono />
        <Field label="Routed to" value={route.label} />
      </dl>

      <div>
        <FieldLabel>Summary</FieldLabel>
        <p className="mt-1 text-sm leading-relaxed text-ink/90">{record.summary}</p>
      </div>

      <div>
        <FieldLabel>Suggested owner / queue</FieldLabel>
        <p className="mt-1 text-sm text-ink/90">{record.owner}</p>
      </div>

      <div className="rounded-xl border border-border bg-surface-2/60 p-3">
        <FieldLabel>Suggested reply</FieldLabel>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{record.reply}</p>
      </div>
    </div>
  );
}

function RecordSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
      <Skeleton className="h-12" />
      <Skeleton className="h-20" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Below: the mock CRM, grouped by routing destination
// ---------------------------------------------------------------------------
function CrmBoard({
  created,
  onSelect,
  selectedId,
}: {
  created: { email: SeedEmail; state: EmailState }[];
  onSelect: (id: string) => void;
  selectedId: string;
}) {
  // Group created records by their routed intent.
  const byIntent = useMemo(() => {
    const map = new Map<Intent, { email: SeedEmail; record: CrmRecord }[]>();
    for (const intent of ROUTE_ORDER) map.set(intent, []);
    for (const { email, state } of created) {
      if (state.record) map.get(state.record.intent)!.push({ email, record: state.record });
    }
    return map;
  }, [created]);

  return (
    <div>
      <div className="mb-4 flex items-end justify-between border-b border-border pb-3">
        <h2 className="font-serif text-2xl font-semibold text-ink">Mock CRM</h2>
        <span className="font-mono text-xs text-faint">routed by destination</span>
      </div>

      {created.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-2/40 py-14 text-center">
          <p className="font-serif text-lg text-ink">No records yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Process an email above and watch it land in the right queue here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ROUTE_ORDER.map((intent) => {
            const route = ROUTES[intent];
            const rows = byIntent.get(intent)!;
            return (
              <div
                key={intent}
                className="rounded-2xl border border-border bg-surface-2/40 p-2"
              >
                <div className="flex items-center gap-2 px-2 py-2">
                  <span className={cn("h-2 w-2 rounded-full", route.dot)} aria-hidden />
                  <span className="text-sm font-medium text-ink">{route.label}</span>
                  <span className="ml-auto font-mono text-xs text-faint">
                    {rows.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {rows.map(({ email, record }) => (
                    <button
                      key={email.id}
                      onClick={() => onSelect(email.id)}
                      className={cn(
                        "block w-full rounded-lg border border-l-2 border-border bg-surface p-2.5 text-left transition-colors hover:border-ink/20",
                        route.ring,
                        email.id === selectedId && "ring-1 ring-accent/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-ink">
                          {record.company}
                        </span>
                        <UrgencyDot urgency={record.urgency} />
                      </div>
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {record.contactName}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs leading-snug text-faint">
                        {record.summary}
                      </span>
                    </button>
                  ))}
                  {rows.length === 0 && (
                    <p className="px-2 pb-2 text-xs text-faint">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------
function senderName(from: string): string {
  const m = from.match(/^\s*"?([^"<]+?)"?\s*</);
  if (m) return m[1].trim();
  return from.replace(/[<>]/g, "").trim();
}

function StatusPill({ state }: { state: EmailState }) {
  if (state.status === "processing")
    return (
      <span className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-accent">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
        extracting…
      </span>
    );
  if (state.record) {
    const route = ROUTES[state.record.intent];
    return (
      <span className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-[11px] text-faint">
        <span className={cn("h-1.5 w-1.5 rounded-full", route.dot)} />
        routed → {route.label}
      </span>
    );
  }
  if (state.status === "error")
    return (
      <span className="mt-0.5 font-mono text-[11px] text-red-500">failed — retry</span>
    );
  return (
    <span className="mt-0.5 font-mono text-[11px] text-faint">unprocessed</span>
  );
}

function IntentChip({ intent }: { intent: Intent }) {
  const route = ROUTES[intent];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide",
        route.chip
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", route.dot)} aria-hidden />
      {intent}
    </span>
  );
}

function UrgencyChip({ urgency }: { urgency: CrmRecord["urgency"] }) {
  const tone =
    urgency === "high"
      ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
      : urgency === "med"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        : "border-border bg-surface-2 text-faint";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide",
        tone
      )}
    >
      {URGENCY_LABEL[urgency]} urgency
    </span>
  );
}

function UrgencyDot({ urgency }: { urgency: CrmRecord["urgency"] }) {
  const color =
    urgency === "high"
      ? "bg-red-500"
      : urgency === "med"
        ? "bg-amber-500"
        : "bg-border";
  return (
    <span
      className={cn("h-1.5 w-1.5 shrink-0 rounded-full", color)}
      title={`${URGENCY_LABEL[urgency]} urgency`}
      aria-label={`${URGENCY_LABEL[urgency]} urgency`}
    />
  );
}

function SourceBadge({ source }: { source: Source }) {
  const label =
    source === "live"
      ? "live · Claude"
      : source === "rate-limited"
        ? "sample · rate-limited"
        : "sample data";
  return (
    <span
      className="font-mono text-[11px] text-faint"
      title={
        source === "live"
          ? "Extracted live by claude-haiku-4-5"
          : "Pre-computed extraction (no API key / limit reached) — identical shape to live"
      }
    >
      {label}
    </span>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="w-16 shrink-0 font-mono text-xs text-faint">{label}</dt>
      <dd className="min-w-0 break-words text-ink/90">{value}</dd>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <p className={cn("mt-0.5 break-words text-ink/90", mono && "font-mono text-xs")}>
        {value}
      </p>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-faint">
      {children}
    </span>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-[200px] items-center justify-center px-6 text-center">
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-surface-2", className)} />
  );
}
