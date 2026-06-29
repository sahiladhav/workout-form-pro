import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkExercise, type ExerciseGuidance } from "@/lib/exercise.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Form & Safety Check" },
      {
        name: "description",
        content: "Get beginner form tips and safety guidance for any exercise.",
      },
      { property: "og:title", content: "Form & Safety Check" },
      {
        property: "og:description",
        content: "Get beginner form tips and safety guidance for any exercise.",
      },
    ],
  }),
  component: FormSafetyCheck,
});

function FormSafetyCheck() {
  const check = useServerFn(checkExercise);
  const [exercise, setExercise] = useState("");
  const [result, setResult] = useState<ExerciseGuidance | null>(null);
  const [clarification, setClarification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = exercise.trim();
    if (!name || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setClarification(null);

    try {
      const data = await check({ data: { exercise: name } });
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.clarification) {
        setClarification(data.clarification);
        return;
      }
      if (data.result) setResult(data.result);
    } catch (err) {
      console.error(err);
      setError(
        "Sorry, we couldn't check that exercise right now. Please try again in a moment.",
      );
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
            Form & Safety Check
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Type an exercise to get beginner form tips and safety guidance.
          </p>
        </div>

        {/* Input + Button */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="Enter an exercise (e.g. barbell deadlift)"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            disabled={loading}
            className="h-14 rounded-xl border-input bg-card px-4 text-base shadow-sm transition-colors focus-visible:ring-primary"
          />
          <Button
            type="submit"
            disabled={loading || !exercise.trim()}
            className="h-14 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Checking...
              </>
            ) : (
              "Check it"
            )}
          </Button>
        </form>

        {/* Error */}
        {error && !loading && (
          <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Result Card */}
        {result && !loading && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-8 text-xl font-bold capitalize text-card-foreground">
              {submittedName}
            </h2>

            {/* Form cues */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Form cues</h3>
              </div>
              <ul className="space-y-2.5 pl-7">
                {result.form_cues.map((cue, i) => (
                  <li
                    key={i}
                    className="relative text-sm leading-relaxed text-muted-foreground before:absolute before:left-[-1.125rem] before:top-[0.4rem] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/60"
                  >
                    {cue}
                  </li>
                ))}
              </ul>
            </div>

            {/* Common mistakes */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2.5">
                <XCircle className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold text-foreground">Common mistakes</h3>
              </div>
              <ul className="space-y-2.5 pl-7">
                {result.common_mistakes.map((mistake, i) => (
                  <li
                    key={i}
                    className="relative text-sm leading-relaxed text-muted-foreground before:absolute before:left-[-1.125rem] before:top-[0.4rem] before:h-1.5 before:w-1.5 before:rounded-full before:bg-destructive/60"
                  >
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety flag */}
            {result.safety_flag && (
              <div className="mb-8 rounded-xl border border-warning/20 bg-warning p-5">
                <div className="flex items-start gap-3.5">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.65_0.15_70)]" />
                  <div>
                    <h3 className="mb-1 font-semibold text-warning-foreground">
                      Safety flag
                    </h3>
                    <p className="text-sm leading-relaxed text-warning-foreground/90">
                      {result.safety_flag}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ask a trainer if… */}
            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Ask a trainer if…</h3>
              </div>
              <ul className="space-y-2.5 pl-7">
                {result.ask_a_trainer_if.map((item, i) => (
                  <li
                    key={i}
                    className="relative text-sm leading-relaxed text-muted-foreground before:absolute before:left-[-1.125rem] before:top-[0.4rem] before:h-1.5 before:w-1.5 before:rounded-full before:bg-muted-foreground/50"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
