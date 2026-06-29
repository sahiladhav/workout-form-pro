import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";

const InputSchema = z.object({ exercise: z.string().min(1).max(120) });

const ResultSchema = z.object({
  form_cues: z.array(z.string()).min(3).max(5),
  common_mistakes: z.array(z.string()).min(3).max(5),
  safety_flag: z.string().nullable(),
  ask_a_trainer_if: z.array(z.string()).min(2).max(4),
});

export type ExerciseGuidance = z.infer<typeof ResultSchema>;

export const checkExercise = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ExerciseGuidance> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const { experimental_output } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      experimental_output: Output.object({ schema: ResultSchema }),
      system:
        "You are a careful strength & conditioning coach giving beginner-focused guidance. Keep each bullet short (under ~15 words). Set safety_flag to a single concise warning string only when the exercise carries real injury risk for beginners (e.g. heavy spinal loading, overhead barbell work, ballistic lifts). For low-risk movements (e.g. bicep curl, seated calf raise), set safety_flag to null.",
      prompt: `Exercise: ${data.exercise}\n\nReturn beginner form cues, common mistakes, a safety_flag (or null), and reasons to ask a trainer.`,
    });

    return experimental_output;
  });
