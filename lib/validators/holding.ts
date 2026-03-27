import { z } from "zod";
import { HOLDING_EDITIONS, HOLDING_FINISHES } from "@/lib/holding-options";

export const createHoldingSchema = z.object({
  cardId: z.string().min(1).max(100),
  cardName: z.string().min(1).max(120),
  setName: z.string().min(1).max(120),
  imageUrl: z.string().url().max(500).optional(),
  cardNumber: z.number().int().min(1).max(9999).optional(),
  setTotal: z.number().int().min(1).max(9999).optional(),

  // Optional from the client, but ALWAYS becomes a string in parsed.data
  grade: z
    .string()
    .trim()
    .min(1)
    .max(20)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? v : "RAW")),

  finish: z.enum(HOLDING_FINISHES).default("NORMAL"),
  edition: z.enum(HOLDING_EDITIONS).default("UNLIMITED"),

  purchasePrice: z.number().finite().min(0).max(1_000_000),
  quantity: z.number().int().min(1).max(999),
});

export type CreateHoldingInput = z.infer<typeof createHoldingSchema>;
