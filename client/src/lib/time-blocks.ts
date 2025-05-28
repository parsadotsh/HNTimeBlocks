import type { TimeBlock } from "@shared/schema";

export function generateTimeBlocks(): TimeBlock[] {
  const blocks: TimeBlock[] = [];
  const now = new Date();
  
  // Generate blocks for the last 7 days (28 total blocks: 7 days × 4 blocks per day)
  for (let daysBack = 6; daysBack >= 0; daysBack--) {
    for (let blockIndex = 0; blockIndex < 4; blockIndex++) {
      // Calculate the date for this block
      const blockDate = new Date(now);
      blockDate.setUTCDate(blockDate.getUTCDate() - daysBack);
      
      // Set the start time for this 6-hour block
      const startHour = blockIndex * 6; // 0, 6, 12, 18
      blockDate.setUTCHours(startHour, 0, 0, 0);
      
      // Calculate end time (6 hours later)
      const endDate = new Date(blockDate);
      endDate.setUTCHours(startHour + 6, 0, 0, 0);
      
      // Only include blocks that are in the past
      if (blockDate.getTime() < now.getTime()) {
        // Create day label
        const today = new Date(now);
        today.setUTCHours(0, 0, 0, 0);
        
        const blockDateOnly = new Date(blockDate);
        blockDateOnly.setUTCHours(0, 0, 0, 0);
        
        const daysDiff = Math.round((today.getTime() - blockDateOnly.getTime()) / (1000 * 60 * 60 * 24));
        
        let dayLabel = "";
        if (daysDiff === 0) {
          dayLabel = "Today";
        } else if (daysDiff === 1) {
          dayLabel = "Yesterday";
        } else {
          dayLabel = blockDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }
        
        // Create time label
        const endHour = startHour + 6;
        const timeLabel = `${startHour.toString().padStart(2, '0')}:00-${endHour === 24 ? '24' : endHour.toString().padStart(2, '0')}:00`;
        
        // Determine if this is a recent block (last 3 blocks chronologically)
        const blockAgeInHours = (now.getTime() - blockDate.getTime()) / (1000 * 60 * 60);
        const isRecent = blockAgeInHours <= 18; // Last 3 blocks (18 hours)
        
        blocks.push({
          start: Math.floor(blockDate.getTime() / 1000),
          end: Math.floor(endDate.getTime() / 1000),
          label: `${dayLabel} ${timeLabel}`,
          date: blockDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          isRecent
        });
      }
    }
  }
  
  return blocks;
}

export async function fetchStoriesForTimeBlock(start: number, end: number) {
  try {
    // Use Algolia HN API directly
    const algoliaUrl = `https://hn.algolia.com/api/v1/search_by_date?tags=story&numericFilters=created_at_i>${start},created_at_i<${end}&hitsPerPage=100`;
    
    const response = await fetch(algoliaUrl);
    
    if (!response.ok) {
      throw new Error(`Algolia API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Sort by points descending to get top stories
    const sortedStories = data.hits
      .filter((story: any) => story.title && story.points > 0)
      .sort((a: any, b: any) => b.points - a.points);

    return {
      hits: sortedStories,
      nbHits: data.nbHits,
      page: data.page || 0,
      nbPages: data.nbPages || 1,
    };
  } catch (error) {
    console.error("Error fetching stories:", error);
    throw error;
  }
}