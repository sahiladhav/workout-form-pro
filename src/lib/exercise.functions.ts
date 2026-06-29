import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  exercise: z.string().min(1).max(400),
  clarification: z.string().max(400).optional(),
});

const ResultSchema = z.object({
  exercise_name: z.string().min(1),
  form_cues: z.array(z.string()).min(3).max(5),
  common_mistakes: z.array(z.string()).min(3).max(5),
  safety_flag: z.string().nullable(),
  ask_a_trainer_if: z.array(z.string()).min(2).max(4),
});

const ClarifySchema = z.object({
  needs_clarification: z.literal(true),
  clarification_message: z.string().min(1),
});

export type ExerciseGuidance = z.infer<typeof ResultSchema>;

export type CheckExerciseResponse =
  | { result: ExerciseGuidance; clarification: null; error: null }
  | { result: null; clarification: string; error: null }
  | { result: null; clarification: null; error: string };

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  const candidate = cleaned || text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object in model response");

  const json = candidate
    .slice(start, end + 1)
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return JSON.parse(json);
}

export const checkExercise = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<CheckExerciseResponse> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        result: null,
        clarification: null,
        error: "AI checking is not available right now. Please try again in a moment.",
      };
    }

    try {
      const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
      const gateway = createLovableAiGatewayProvider(key);

      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system:
          "You are a careful strength & conditioning coach giving beginner-focused guidance. The user may type an exact exercise name OR a plain-English description of a movement or machine. First, identify the most likely exercise. Then reply with a single JSON object and nothing else — no prose, no markdown fences.\n\nIf you can confidently identify the exercise, respond with this shape:\n{\n  \"exercise_name\": string (the canonical exercise name in Title Case, e.g. \"Chest Press Machine\", \"Barbell Deadlift\"),\n  \"form_cues\": array of 3-5 short strings,\n  \"common_mistakes\": array of 3-5 short strings,\n  \"safety_flag\": a single short warning string OR null,\n  \"ask_a_trainer_if\": array of 2-4 short strings\n}\nKeep each bullet under ~15 words. Set safety_flag to null for low-risk movements (e.g. bicep curl, seated calf raise); use a concise warning string when there is real beginner injury risk (heavy spinal loading, overhead barbell work, ballistic lifts, etc.).\n\nIf the description is too vague or ambiguous to identify a specific exercise, instead respond with:\n{\n  \"needs_clarification\": true,\n  \"clarification_message\": a single friendly sentence asking for ONE more specific detail (e.g. which body part it works, whether you sit or stand, push or pull, machine or free-weight).\n}\nUse this clarification path only when truly unclear — if a reasonable best guess exists, return the full guidance instead.",
        prompt: data.clarification
          ? `Original user input: ${data.exercise}\nUser's clarification: ${data.clarification}\n\nUse both together to identify the exercise. Do NOT ask for further clarification — make your best reasonable guess and return the full guidance JSON. Return only valid JSON now.`
          : `User input: ${data.exercise}\n\nReturn only valid JSON now.`,
      });

      const parsed = extractJson(text);
      if (!data.clarification) {
        const clarify = ClarifySchema.safeParse(parsed);
        if (clarify.success) {
          return { result: null, clarification: clarify.data.clarification_message, error: null };
        }
      }
      const result = ResultSchema.parse(parsed);
      return { result, clarification: null, error: null };
    } catch (error) {
      console.error("Exercise guidance generation failed", error);
      return {
        result: null,
        clarification: null,
        error: "Sorry, we couldn't check that exercise right now. Please try again in a moment.",
      };
    }
  });
