import { z } from "zod";

export const storySchema = z.object({
  objectID: z.string(),
  title: z.string(),
  url: z.string().nullable(),
  author: z.string(),
  points: z.number(),
  num_comments: z.number(),
  created_at_i: z.number(),
  story_text: z.string().nullable().optional(),
});

export const timeBlockSchema = z.object({
  start: z.number(),
  end: z.number(),
  label: z.string(),
  date: z.string(),
  isRecent: z.boolean(),
});

export type Story = z.infer<typeof storySchema>;
export type TimeBlock = z.infer<typeof timeBlockSchema>;

export interface StoriesResponse {
  hits: Story[];
  nbHits: number;
  page: number;
  nbPages: number;
}
