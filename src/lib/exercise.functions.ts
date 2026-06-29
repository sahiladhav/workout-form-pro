import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const InputSchema = z.object({ exercise: z.string().min(1).max(120) });

const ResultSchema = z.object({
  form_cues: z.array(z.string()).min(3).max(5),
  common_mistakes: z.array(z.string()).min(3).max(5),
  safety_flag: z.string().nullable(),
  ask_a_trainer_if: z.array(z.string()).min(2).max(4),
});

export type ExerciseGuidance = z.infer<typeof ResultSchema>;

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in model response");
  return JSON.parse(candidate.slice(start, end + 1));
}

export const checkExercise = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ExerciseGuidance> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const { text } = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system:
        "You are a careful strength & conditioning coach giving beginner-focused guidance for gym beginners. Always reply with a single JSON object and nothing else — no prose, no markdown fences. The JSON must have exactly these keys: form_cues (array of 3-5 short strings), common_mistakes (array of 3-5 short strings), safety_flag (a single short warning string OR null), ask_a_trainer_if (array of 2-4 short strings). Keep each bullet under ~15 words. Set safety_flag to null for low-risk movements (e.g. bicep curl, seated calf raise); use a concise warning string when the exercise carries real beginner injury risk (e.g. heavy spinal loading, overhead barbell work, ballistic lifts).",
      prompt: `Exercise: ${data.exercise}\n\nReturn the JSON object now.`,
    });

    const parsed = ResultSchema.parse(extractJson(text));
    return parsed;
  });

