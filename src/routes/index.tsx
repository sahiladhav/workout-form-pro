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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildPlan, type StarterPlan, type PlanInput } from "@/lib/exercise.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Beginner Gym Starting Plan" },
      {
        name: "description",
        content:
          "Answer 3 quick questions and get a simple, encouraging beginner gym plan.",
      },
      { property: "og:title", content: "Beginner Gym Starting Plan" },
      {
        property: "og:description",
        content:
          "Answer 3 quick questions and get a simple, encouraging beginner gym plan.",
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
    <div className="min-h-screen bg-background px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Dumbbell className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Beginner Gym Starting Plan
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Three quick questions and we'll build you a simple, encouraging plan.
          </p>
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
            className="h-14 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Building your plan...
              </>
            ) : (
              "Build my plan"
            )}
          </Button>
        </form>

        {/* Error */}
        {error && !loading && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Plan */}
        {plan && !loading && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-8 text-xl font-bold text-card-foreground">
              {plan.plan_title}
            </h2>

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

            <div className="mb-8 rounded-xl border border-warning/20 bg-warning p-5">
              <div className="flex items-start gap-3.5">
                <Heart className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.65_0.15_70)]" />
                <div className="flex-1">
                  <h3 className="mb-3 font-semibold text-warning-foreground">
                    How to not burn out
                  </h3>
                  <ul className="space-y-2 pl-4">
                    {plan.avoid_burnout.map((item, i) => (
                      <li
                        key={i}
                        className="relative text-sm leading-relaxed text-warning-foreground/90 before:absolute before:left-[-0.875rem] before:top-[0.4rem] before:h-1.5 before:w-1.5 before:rounded-full before:bg-warning-foreground/50"
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
    <fieldset disabled={disabled} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <legend className="px-1 text-sm font-semibold text-foreground">{label}</legend>
      <div className={inline ? "mt-3 grid grid-cols-3 gap-2" : "mt-3 flex flex-col gap-2"}>
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={
                "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors " +
                (selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-input bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground")
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </fieldset>
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
    <div className={noMargin ? "" : "mb-8"}>
      <div className="mb-3 flex items-center gap-2.5">
        {icon}
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <ul className="space-y-2.5 pl-7">
        {items.map((item, i) => (
          <li
            key={i}
            className={
              "relative text-sm leading-relaxed text-muted-foreground before:absolute before:left-[-1.125rem] before:top-[0.4rem] before:h-1.5 before:w-1.5 before:rounded-full before:" +
              dotClass
            }
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
