import { useRef, useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { site } from "../content";
import { Roll, SplitReveal } from "../components/Motion";
import { gsap } from "../lib/motion";

const kinds = ["Website", "Landing page", "Web app", "AI feature", "UI & UX design", "AI photography", "Something else"];
const budgets = ["Under $1k", "$1k – $3k", "$3k – $6k", "$6k+"];

// EmailJS keys come from .env (see .env.example). All three are safe to ship to the browser.
const EMAILJS = {
  service: import.meta.env.VITE_EMAILJS_SERVICE_ID as string | undefined,
  template: import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined,
};
const emailjsReady = Boolean(EMAILJS.service && EMAILJS.template && EMAILJS.publicKey);

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [kind, setKind] = useState<string[]>([]);
  const [budget, setBudget] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [sender, setSender] = useState("");
  const done = useRef<HTMLDivElement>(null);

  const toggle = (k: string) => setKind((v) => (v.includes(k) ? v.filter((x) => x !== k) : [...v, k]));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const name = String(f.get("name") ?? "").trim();
    const email = String(f.get("email") ?? "").trim();
    const message = String(f.get("message") ?? "").trim();
    const project = kind.join(", ") || "Not specified";
    const budgetText = budget ?? "Not specified";

    // honeypot: real people never see or fill this field
    if (f.get("company")) {
      setStatus("sent");
      return;
    }

    // Keys not set yet: fall back to opening the visitor's mail app.
    if (!emailjsReady) {
      const body = [`Name: ${name}`, `Email: ${email}`, `Project: ${project}`, `Budget: ${budgetText}`, "", message].join("\n");
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
        `New project from ${name}`
      )}&body=${encodeURIComponent(body)}`;
      return;
    }

    setStatus("sending");
    try {
      // These names must match the {{variables}} used in your EmailJS template.
      await emailjs.send(
        EMAILJS.service!,
        EMAILJS.template!,
        {
          from_name: name,
          from_email: email,
          reply_to: email,
          project_type: project,
          budget: budgetText,
          message,
          title: `New project from ${name}`,
        },
        { publicKey: EMAILJS.publicKey! }
      );
      setSender(name.split(" ")[0]);
      setStatus("sent");
      form.reset();
      setKind([]);
      setBudget(null);
      requestAnimationFrame(() => {
        if (done.current)
          gsap.fromTo(done.current.children, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out", stagger: 0.08 });
      });
    } catch (err) {
      console.error("EmailJS send failed", err);
      setStatus("error");
    }
  };

  return (
    <main className="page contact">
      <header className="page-head">
        <SplitReveal as="h1" type="chars" mode="intro" random className="page-head__title">
          Let's talk
        </SplitReveal>
        <SplitReveal as="p" type="lines" mode="intro" delay={0.35} className="page-head__lead">
          Tell me about your idea. I reply to every message within two working days.
        </SplitReveal>
      </header>

      <div className="contact__grid">
        {status === "sent" ? (
          <div className="form-done" ref={done} role="status">
            <span className="case__label">Message sent</span>
            <p className="form-done__title">Thanks{sender ? `, ${sender}` : ""}. Your message is on its way.</p>
            <p className="form-done__body">I'll read it and reply to your email within two working days.</p>
            <button className="btn btn--line" onClick={() => setStatus("idle")}>
              <Roll text="Send another message" />
            </button>
          </div>
        ) : (
          <form className="form" onSubmit={submit} aria-busy={status === "sending"}>
            <fieldset>
              <legend>What do you need?</legend>
              <div className="chips">
                {kinds.map((k) => (
                  <button type="button" key={k} className="chip" aria-pressed={kind.includes(k)} onClick={() => toggle(k)}>
                    {k}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Budget</legend>
              <div className="chips">
                {budgets.map((b) => (
                  <button type="button" key={b} className="chip" aria-pressed={budget === b} onClick={() => setBudget(b)}>
                    {b}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="field">
              <span>Your name</span>
              <input name="name" required autoComplete="name" maxLength={120} />
            </label>
            <label className="field">
              <span>Email</span>
              <input name="email" type="email" required autoComplete="email" maxLength={200} />
            </label>
            <label className="field">
              <span>About the project</span>
              <textarea
                name="message"
                rows={4}
                required
                maxLength={5000}
                placeholder="Goals, timeline, links to sites you like"
              />
            </label>

            {/* spam trap, hidden from people and screen readers */}
            <input className="form__trap" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />

            <button className="btn btn--ink" type="submit" disabled={status === "sending"}>
              <Roll text={status === "sending" ? "Sending…" : "Send message"} />
              <span className="btn__arrow" aria-hidden="true">↳</span>
            </button>

            {status === "error" && (
              <p className="form__note form__note--error" role="alert">
                The message didn't send. Check your connection and try again, or write to{" "}
                <a href={`mailto:${site.email}`}>{site.email}</a>.
              </p>
            )}
          </form>
        )}

        <aside className="contact__aside">
          <div>
            <h2 className="case__label">Email</h2>
            <a href={`mailto:${site.email}`} className="contact__big">
              <Roll text={site.email} />
            </a>
          </div>
          <div>
            <h2 className="case__label">Elsewhere</h2>
            <ul>
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="contact__big">
                    <Roll text={s.label} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="case__label">Based</h2>
            <p>{site.location}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
