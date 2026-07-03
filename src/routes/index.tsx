import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Dumbbell,
  CalendarDays,
  Activity,
  Heart,
  AlertTriangle,
  Loader2,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildPlan, type StarterPlan, type PlanInput } from "@/lib/exercise.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Beginner Gym Plan Generator" },
      {
        name: "description",
        content:
          "Answer 3 quick questions and get a simple, encouraging, beginner-safe gym plan built by AI.",
      },
      { property: "og:title", content: "AI Beginner Gym Plan Generator" },
      {
        property: "og:description",
        content:
          "Answer 3 quick questions and get a simple, encouraging, beginner-safe gym plan built by AI.",
      },
    ],
  }),
  component: StartingPlan,
});

type Goal = PlanInput["goal"];
type Days = PlanInput["days"];
type Level = PlanInput["level"];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: "strength_muscle", label: "Build strength / muscle" },
  { value: "lose_fat", label: "Lose fat" },
  { value: "habit", label: "Just build the habit / get moving" },
];

const DAY_OPTIONS: { value: Days; label: string }[] = [
  { value: "2", label: "2 days" },
  { value: "3", label: "3 days" },
  { value: "4", label: "4 days" },
];

const LEVEL_OPTIONS: { value: Level; label: string }[] = [
  { value: "total_beginner", label: "Total beginner (never trained)" },
  { value: "returning", label: "Returning after a long break" },
];

function StartingPlan() {
  const build = useServerFn(buildPlan);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [days, setDays] = useState<Days | null>(null);
  const [level, setLevel] = useState<Level | null>(null);
  const [plan, setPlan] = useState<StarterPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = goal && days && level;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || loading) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const data = await build({ data: { goal, days, level } });
      if (data.error) setError(data.error);
      else if (data.result) setPlan(data.result);
    } catch (err) {
      console.error(err);
      setError("Sorry, we couldn't build your plan right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated background glow orbs */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
        <div className="animate-blob animation-delay-2000 absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="animate-blob animation-delay-4000 absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 py-10 sm:py-16 lg:grid-cols-2 lg:items-stretch lg:gap-16 lg:px-8 lg:py-24">
        {/* Left: hero + form */}
        <div className="flex flex-col gap-8">
          <Hero />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Question
              label="What's your main goal?"
              options={GOAL_OPTIONS}
              value={goal}
              onChange={setGoal}
              disabled={loading}
            />
            <Question
              label="How many days a week can you realistically train?"
              options={DAY_OPTIONS}
              value={days}
              onChange={setDays}
              disabled={loading}
              inline
            />
            <Question
              label="Where are you starting from?"
              options={LEVEL_OPTIONS}
              value={level}
              onChange={setLevel}
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading || !ready}
              className={cn(
                "group h-14 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-base font-semibold text-primary-foreground shadow-[0_0_25px_-5px_var(--color-primary)] transition-all duration-300",
                "hover:shadow-[0_0_35px_-2px_var(--color-primary)] hover:scale-[1.01] active:scale-[0.98]",
                "disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Building your plan...
                </>
              ) : (
                <>
                  Build my plan
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right: AI output panel */}
        <div className="flex">
          <OutputPanel plan={plan} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <div className="flex flex-col gap-5">
      <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-xl">
        <Sparkles className="h-3.5 w-3.5 text-primary" />
        AI-powered starting plan
      </div>

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-cyan-400 shadow-[0_0_25px_-5px_var(--color-primary)]">
        <Dumbbell className="h-6 w-6 text-primary-foreground" />
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Your beginner gym plan,{" "}
        <span className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
          built by AI
        </span>
      </h1>

      <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
        Answer three quick questions and get a simple, encouraging plan — no guesswork,
        no extreme advice, just a realistic way to start.
      </p>

      <TrustBadges />
    </div>
  );
}

function TrustBadges() {
  const items = [
    { icon: ShieldCheck, label: "Beginner-safe" },
    { icon: CheckCircle2, label: "Realistic plan" },
    { icon: Heart, label: "No extreme diet advice" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-xl"
        >
          <Icon className="h-3.5 w-3.5 text-primary" />
          {label}
        </span>
      ))}
    </div>
  );
}

function Question<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
  inline,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  disabled?: boolean;
  inline?: boolean;
}) {
  return (
    <fieldset
      disabled={disabled}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
    >
      <legend className="px-1 text-sm font-semibold text-foreground/90">{label}</legend>
      <div className={inline ? "mt-3 grid grid-cols-3 gap-2" : "mt-3 flex flex-col gap-2"}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center justify-between gap-2 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                selected
                  ? "border-primary/60 bg-primary/15 text-foreground shadow-[0_0_20px_-6px_var(--color-primary)]"
                  : "border-white/10 bg-white/[0.02] text-muted-foreground hover:border-primary/30 hover:bg-white/[0.05] hover:text-foreground",
              )}
            >
              <span>{opt.label}</span>
              {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function OutputPanel({
  plan,
  loading,
  error,
}: {
  plan: StarterPlan | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="relative flex w-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-1 shadow-[0_0_60px_-20px_var(--color-primary)] backdrop-blur-2xl">
      <div className="flex w-full flex-1 flex-col rounded-[1.35rem] bg-gradient-to-b from-white/[0.04] to-transparent p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Your AI coach
          </h2>
        </div>

        {loading && <LoadingState />}

        {!loading && error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {!loading && !error && !plan && <EmptyState />}

        {!loading && !error && plan && (
          <div
            key={plan.plan_title}
            className="animate-in fade-in-0 slide-in-from-bottom-6 duration-700"
          >
            <h3 className="mb-4 text-xl font-bold text-foreground">{plan.plan_title}</h3>

            <Section
              icon={<CalendarDays className="h-5 w-5 text-primary" />}
              title="Your first 4 weeks"
              items={plan.first_four_weeks}
              dotClass="bg-primary/60"
            />

            <Section
              icon={<Activity className="h-5 w-5 text-primary" />}
              title="A typical session"
              items={plan.typical_session}
              dotClass="bg-primary/60"
            />

            <div className="mb-5 rounded-xl border border-warning/30 bg-warning/40 p-4 backdrop-blur-xl">
              <div className="flex items-start gap-3.5">
                <Heart className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.75_0.15_70)]" />
                <div className="flex-1">
                  <h3 className="mb-2 font-semibold text-warning-foreground">
                    How to not burn out
                  </h3>
                  <ul className="space-y-1.5 pl-4">
                    {plan.avoid_burnout.map((item, i) => (
                      <li
                        key={i}
                        className="relative text-sm leading-snug text-warning-foreground/90 before:absolute before:left-[-0.875rem] before:top-[0.4rem] before:h-1.5 before:w-1.5 before:rounded-full before:bg-warning-foreground/50"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <Section
              icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
              title="When to get help"
              items={plan.when_to_get_help}
              dotClass="bg-destructive/60"
              noMargin
            />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04]">
        <Dumbbell className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <p className="font-medium text-foreground">Your personalized plan will appear here</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Answer the three questions and hit "Build my plan" to get started.
        </p>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div>
        <p className="font-medium text-foreground">Building your plan...</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Our AI coach is putting together a safe, realistic starting point for you.
        </p>
      </div>
      <div className="w-full max-w-xs space-y-2">
        <div className="h-2 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-2 w-4/5 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-2 w-3/5 animate-pulse rounded-full bg-white/[0.06]" />
      </div>
    </div>
  );
}

function Section({
  icon,
  title,
  items,
  dotClass,
  noMargin,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  dotClass: string;
  noMargin?: boolean;
}) {
  return (
    <div className={noMargin ? "" : "mb-5"}>
      <div className="mb-2 flex items-center gap-2.5">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-1.5 pl-7">
        {items.map((item, i) => (
          <li key={i} className="relative text-sm leading-snug text-muted-foreground">
            <span
              className={
                "absolute left-[-1.125rem] top-[0.55rem] h-1.5 w-1.5 rounded-full " + dotClass
              }
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
