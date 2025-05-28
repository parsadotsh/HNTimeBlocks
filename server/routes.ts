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
      
      // Start from 7 days ago and work forward to now
      const startDate = new Date(now);
      startDate.setUTCDate(startDate.getUTCDate() - 7);
      startDate.setUTCHours(0, 0, 0, 0); // Start from midnight
      
      // Generate all 6-hour blocks from 7 days ago to now
      const currentTime = now.getTime();
      let blockStart = startDate.getTime();
      
      while (blockStart < currentTime) {
        const blockStartDate = new Date(blockStart);
        const blockEndDate = new Date(blockStart + (6 * 60 * 60 * 1000)); // Add 6 hours
        
        const startHour = blockStartDate.getUTCHours();
        const endHour = blockEndDate.getUTCHours();
        
        // Create day label
        const blockDate = new Date(blockStartDate);
        const daysDiff = Math.floor((now.getTime() - blockDate.getTime()) / (1000 * 60 * 60 * 24));
        
        let dayLabel = "";
        if (daysDiff === 0) {
          dayLabel = "Today";
        } else if (daysDiff === 1) {
          dayLabel = "Yesterday";
        } else {
          dayLabel = blockDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
        
        const timeLabel = `${startHour.toString().padStart(2, '0')}:00-${endHour.toString().padStart(2, '0')}:00`;
        
        // Check if this is a recent block (last 3 blocks chronologically)
        const blocksFromEnd = Math.floor((currentTime - blockStart) / (6 * 60 * 60 * 1000));
        const isRecent = blocksFromEnd <= 2;
        
        blocks.push({
          start: Math.floor(blockStart / 1000),
          end: Math.floor(blockEndDate.getTime() / 1000),
          label: `${dayLabel} ${timeLabel}`,
          date: blockDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          isRecent
        });
        
        // Move to next 6-hour block
        blockStart += (6 * 60 * 60 * 1000);
      }
      
      res.json(blocks); // Return in chronological order (oldest first)
    } catch (error) {
      console.error("Error generating time blocks:", error);
      res.status(500).json({ message: "Failed to generate time blocks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
