"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/contact/actions";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

/**
 * ContactForm — a real qualifying form (not a mailto). Posts to the
 * submitContact server action. Shows inline validation, a pending state, and a
 * success view. Includes a honeypot field and is rate-limited server-side.
 *
 * useActionState/useFormStatus (React 19) wire the server action's state and
 * pending status; the action runs on the server, so no client fetch is needed.
 */
const BUDGETS = ["Not sure yet", "Under $2k", "$2k–$5k", "$5k–$15k", "$15k+"];
const TIMELINES = ["ASAP", "2–4 weeks", "1–2 months", "Just exploring"];

const initial: ContactState = { ok: false };

export function ContactForm() {
  const [state, formAction] = useActionState(submitContact, initial);

  // Success view — warm, done, no dead end.
  if (state.ok) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="mt-5 font-serif text-2xl font-semibold text-ink">
          Message sent.
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-muted">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Honeypot — visually hidden, off-screen, not focusable. Bots fill it. */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Name" error={state.fieldErrors?.name} required>
          <input
            name="name"
            type="text"
            autoComplete="name"
            className={inputCls}
            placeholder="Your name"
          />
        </Field>
        <Field label="Email" error={state.fieldErrors?.email} required>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={inputCls}
            placeholder="you@company.com"
          />
        </Field>
      </div>

      <Field label="Company" optional error={state.fieldErrors?.company}>
        <input
          name="company"
          type="text"
          autoComplete="organization"
          className={inputCls}
          placeholder="What you're building / where you work"
        />
      </Field>

      <Field
        label="What do you need?"
        error={state.fieldErrors?.need}
        required
      >
        <textarea
          name="need"
          rows={4}
          className={cn(inputCls, "resize-y")}
          placeholder="The process that's eating your time, the tool you wish existed, the dashboard you keep rebuilding in spreadsheets…"
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Rough budget" optional>
          <select name="budget" className={inputCls} defaultValue="">
            <option value="">Select a range…</option>
            {BUDGETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Timeline" optional>
          <select name="timeline" className={inputCls} defaultValue="">
            <option value="">When do you need it?</option>
            {TIMELINES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Form-level message (non-field errors). */}
      {state.message && !state.ok && (
        <p className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
          {state.message}
        </p>
      )}

      <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <SubmitButton />
        <p className="text-xs text-faint">
          No pitch, no spam. If it&rsquo;s not a fit, I&rsquo;ll say so.
        </p>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-bg px-4 py-3 text-ink placeholder:text-faint transition-colors focus:border-accent focus:outline-none";

function Field({
  label,
  error,
  required,
  optional,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline gap-2 text-sm font-medium text-ink">
        {label}
        {required && <span className="text-accent">*</span>}
        {optional && <span className="font-mono text-xs text-faint">optional</span>}
      </span>
      {children}
      {error && (
        <span className="mt-1.5 block text-sm text-accent" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

// Separate component so useFormStatus can read the parent form's pending state.
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-w-[160px]">
      {pending ? "Sending…" : "Send message"}
    </Button>
  );
}
