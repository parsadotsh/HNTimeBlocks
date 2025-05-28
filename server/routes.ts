import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get stories for a specific time block
  app.get("/api/stories", async (req, res) => {
    try {
      const { start, end } = req.query;
      
      if (!start || !end) {
        return res.status(400).json({ message: "Start and end timestamps are required" });
      }

      const startTime = parseInt(start as string);
      const endTime = parseInt(end as string);

      // Use Algolia HN API to search for stories in the time range
      const algoliaUrl = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${startTime},created_at_i<${endTime}&hitsPerPage=100`;
      
      const response = await fetch(algoliaUrl);
      
      if (!response.ok) {
        throw new Error(`Algolia API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sort by points descending to get top stories
      const sortedStories = data.hits
        .filter((story: any) => story.title && story.points > 0)
        .sort((a: any, b: any) => b.points - a.points);

      res.json({
        hits: sortedStories,
        nbHits: data.nbHits,
        page: data.page || 0,
        nbPages: data.nbPages || 1,
      });
    } catch (error) {
      console.error("Error fetching stories:", error);
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  // Get current time blocks for the last 7 days
  app.get("/api/time-blocks", async (req, res) => {
    try {
      const blocks = [];
      const now = new Date();
      
      // Calculate the current 6-hour block we're in
      const currentHour = now.getUTCHours();
      const currentBlockIndex = Math.floor(currentHour / 6); // 0, 1, 2, or 3
      
      // Generate blocks going back in time (28 blocks = 7 days * 4 blocks per day)
      for (let i = 27; i >= 0; i--) { // Start from oldest, go to newest
        const hoursBack = i * 6;
        const blockStartTime = new Date(now.getTime() - (hoursBack * 60 * 60 * 1000));
        
        // Round down to the nearest 6-hour boundary
        const blockHour = Math.floor(blockStartTime.getUTCHours() / 6) * 6;
        blockStartTime.setUTCHours(blockHour, 0, 0, 0);
        
        const blockEndTime = new Date(blockStartTime.getTime() + (6 * 60 * 60 * 1000));
        
        // Create day label
        const todayUTC = new Date(now);
        todayUTC.setUTCHours(0, 0, 0, 0);
        
        const blockDateOnly = new Date(blockStartTime);
        blockDateOnly.setUTCHours(0, 0, 0, 0);
        
        const daysDiff = Math.round((todayUTC.getTime() - blockDateOnly.getTime()) / (1000 * 60 * 60 * 24));
        
        let dayLabel = "";
        if (daysDiff === 0) {
          dayLabel = "Today";
        } else if (daysDiff === 1) {
          dayLabel = "Yesterday";
        } else {
          dayLabel = blockStartTime.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
        
        const startHour = blockStartTime.getUTCHours();
        const endHour = blockEndTime.getUTCHours();
        const timeLabel = `${startHour.toString().padStart(2, '0')}:00-${endHour === 0 ? '24' : endHour.toString().padStart(2, '0')}:00`;
        
        // Check if this is a recent block (last 3 blocks)
        const isRecent = i <= 2;
        
        blocks.push({
          start: Math.floor(blockStartTime.getTime() / 1000),
          end: Math.floor(blockEndTime.getTime() / 1000),
          label: `${dayLabel} ${timeLabel}`,
          date: blockStartTime.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          isRecent
        });
      }
      
      res.json(blocks); // Already in chronological order (oldest first)
    } catch (error) {
      console.error("Error generating time blocks:", error);
      res.status(500).json({ message: "Failed to generate time blocks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
