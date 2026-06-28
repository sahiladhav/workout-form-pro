import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Dumbbell,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Form & Safety Check" },
      {
        name: "description",
        content:
          "Get beginner form tips and safety guidance for any exercise.",
      },
      { property: "og:title", content: "Form & Safety Check" },
      {
        property: "og:description",
        content:
          "Get beginner form tips and safety guidance for any exercise.",
      },
    ],
  }),
  component: FormSafetyCheck,
});

const EXAMPLE_RESULT = {
  exercise: "Barbell Deadlift",
  formCues: [
    "Keep the bar close to your shins throughout the lift",
    "Maintain a neutral spine — imagine a broomstick along your back",
    "Push the floor away with your legs, don't pull with your arms",
    "Drive your hips forward to lock out at the top",
  ],
  commonMistakes: [
    "Rounding the lower back under load",
    "Letting the bar drift away from your body",
    "Jerking the bar off the floor instead of building tension",
  ],
  safetyFlag: {
    show: true,
    text: "This exercise places significant load on your lower back. Start with very light weight and master the hip-hinge pattern before adding load.",
  },
  askTrainer: [
    "You have a history of back injury or chronic pain",
    "You're unsure about your depth or bar path",
    "The movement feels wrong or causes any sharp pain",
  ],
};

function FormSafetyCheck() {
  const [exercise, setExercise] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
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
            className="h-14 rounded-xl border-input bg-card px-4 text-base shadow-sm transition-colors focus-visible:ring-primary"
          />
          <Button
            type="submit"
            className="h-14 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Check it
          </Button>
        </form>

        {/* Result Card */}
        {showResults && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="mb-8 text-xl font-bold text-card-foreground">
              {EXAMPLE_RESULT.exercise}
            </h2>

            {/* Form cues */}
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Form cues</h3>
              </div>
              <ul className="space-y-2.5 pl-7">
                {EXAMPLE_RESULT.formCues.map((cue, i) => (
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
                <h3 className="font-semibold text-foreground">
                  Common mistakes
                </h3>
              </div>
              <ul className="space-y-2.5 pl-7">
                {EXAMPLE_RESULT.commonMistakes.map((mistake, i) => (
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
            {EXAMPLE_RESULT.safetyFlag.show && (
              <div className="mb-8 rounded-xl border border-warning/20 bg-warning p-5">
                <div className="flex items-start gap-3.5">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[oklch(0.65_0.15_70)]" />
                  <div>
                    <h3 className="mb-1 font-semibold text-warning-foreground">
                      Safety flag
                    </h3>
                    <p className="text-sm leading-relaxed text-warning-foreground/90">
                      {EXAMPLE_RESULT.safetyFlag.text}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Ask a trainer if… */}
            <div>
              <div className="mb-3 flex items-center gap-2.5">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">
                  Ask a trainer if…
                </h3>
              </div>
              <ul className="space-y-2.5 pl-7">
                {EXAMPLE_RESULT.askTrainer.map((item, i) => (
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
