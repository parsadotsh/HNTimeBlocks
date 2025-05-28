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
      const utcNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      
      // Calculate current 6-hour block
      const currentHour = utcNow.getUTCHours();
      const currentBlock = Math.floor(currentHour / 6);
      
      // Generate blocks going back 7 days (28 blocks total)
      for (let i = 0; i < 28; i++) {
        const blockDate = new Date(utcNow);
        const dayOffset = Math.floor(i / 4);
        blockDate.setUTCDate(blockDate.getUTCDate() - dayOffset);
        
        const blockIndex = (currentBlock - (i % 4) + 4) % 4;
        const startHour = blockIndex * 6;
        const endHour = startHour + 6;
        
        // Calculate actual timestamps
        const blockStart = new Date(blockDate);
        blockStart.setUTCHours(startHour, 0, 0, 0);
        
        const blockEnd = new Date(blockDate);
        blockEnd.setUTCHours(endHour, 0, 0, 0);
        
        // Create label
        let dayLabel = "";
        const daysDiff = dayOffset;
        if (daysDiff === 0) {
          dayLabel = "Today";
        } else if (daysDiff === 1) {
          dayLabel = "Yesterday";
        } else {
          dayLabel = blockDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
        
        const timeLabel = `${startHour.toString().padStart(2, '0')}:00-${endHour.toString().padStart(2, '0')}:00`;
        
        blocks.push({
          start: Math.floor(blockStart.getTime() / 1000),
          end: Math.floor(blockEnd.getTime() / 1000),
          label: `${dayLabel} ${timeLabel}`,
          date: blockDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          isRecent: i < 3 // Latest 3 blocks
        });
      }
      
      res.json(blocks.reverse()); // Return in chronological order
    } catch (error) {
      console.error("Error generating time blocks:", error);
      res.status(500).json({ message: "Failed to generate time blocks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
