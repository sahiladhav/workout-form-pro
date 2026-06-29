import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const GoalSchema = z.enum(["strength_muscle", "lose_fat", "habit"]);
const DaysSchema = z.enum(["2", "3", "4"]);
const LevelSchema = z.enum(["total_beginner", "returning"]);

const InputSchema = z.object({
  goal: GoalSchema,
  days: DaysSchema,
  level: LevelSchema,
});

const ResultSchema = z.object({
  plan_title: z.string().min(1),
  first_four_weeks: z.array(z.string()).min(3).max(6),
  typical_session: z.array(z.string()).min(3).max(6),
  avoid_burnout: z.array(z.string()).min(3).max(6),
  when_to_get_help: z.array(z.string()).min(2).max(5),
});

export type StarterPlan = z.infer<typeof ResultSchema>;
export type PlanInput = z.infer<typeof InputSchema>;

export type BuildPlanResponse =
  | { result: StarterPlan; error: null }
  | { result: null; error: string };

function extractJson(text: string): unknown {
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
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

const GOAL_LABEL: Record<z.infer<typeof GoalSchema>, string> = {
  strength_muscle: "Build strength/muscle",
  lose_fat: "Lose fat",
  habit: "Just build the habit / get moving",
};

const LEVEL_LABEL: Record<z.infer<typeof LevelSchema>, string> = {
  total_beginner: "Total beginner (never trained)",
  returning: "Returning after a long break",
};

export const buildPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<BuildPlanResponse> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      return {
        result: null,
        error: "AI planning isn't available right now. Please try again in a moment.",
      };
    }

    try {
      const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
      const gateway = createLovableAiGatewayProvider(key);

      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system:
          "You are an encouraging, safety-first beginner gym coach. Generate a simple starting plan based on the user's goal, weekly availability, and starting level. Keep the tone warm, plain-English, and beginner-friendly. NEVER give specific calorie numbers, macros, or diet plans; if nutrition comes up at all, just suggest focusing on whole foods and protein and consulting a professional for specifics. Keep guidance general and safety-first.\n\nReply with ONLY a single JSON object, no prose, no markdown fences, with this exact shape:\n{\n  \"plan_title\": short friendly title for the plan (e.g. \"Your 3-day beginner strength starter\"),\n  \"first_four_weeks\": array of 3-6 short strings describing a gentle week-by-week ramp (mention weeks 1-4, easy volume, full-body),\n  \"typical_session\": array of 3-6 short strings listing movement patterns (squat, hinge, push, pull, carry, core) — NOT sets/reps/weights detail,\n  \"avoid_burnout\": array of 3-6 short strings on rest days, starting light, soreness being normal, consistency over intensity,\n  \"when_to_get_help\": array of 2-5 short strings reminding them to start light, listen to their body, see a doctor or trainer if they feel pain or have health conditions\n}\nKeep each bullet under ~20 words.",
        prompt: `Goal: ${GOAL_LABEL[data.goal]}\nDays per week: ${data.days}\nStarting from: ${LEVEL_LABEL[data.level]}\n\nReturn only valid JSON now.`,
      });

      const parsed = extractJson(text);
      const result = ResultSchema.parse(parsed);
      return { result, error: null };
    } catch (error) {
      console.error("Plan generation failed", error);
      return {
        result: null,
        error: "Sorry, we couldn't build your plan right now. Please try again in a moment.",
      };
    }
  });
