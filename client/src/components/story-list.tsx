import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, RefreshCw } from "lucide-react";
import type { TimeBlock, StoriesResponse, Story } from "@shared/schema";
import type { SettingsConfig } from "@/components/settings-modal";
import { getTimeAgo, extractDomain } from "@/lib/time-utils";
import { fetchStoriesForTimeBlock } from "@/lib/time-blocks";

interface StoryListProps {
  selectedBlock: TimeBlock | null;
  settings: SettingsConfig;
}

export function StoryList({ selectedBlock, settings }: StoryListProps) {
  const { data, isLoading, error, refetch } = useQuery<StoriesResponse>({
    queryKey: ["stories", selectedBlock?.start, selectedBlock?.end],
    queryFn: () => fetchStoriesForTimeBlock(selectedBlock!.start, selectedBlock!.end),
    enabled: !!selectedBlock,
  });

  if (!selectedBlock) {
    return (
      <div className="p-4">
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Select a time block to view stories</p>
        </div>
      </div>
    );
  }

  const selectedBlockInfo = () => {
    const dayLabel = selectedBlock.label.split(' ')[0];
    const timeRange = selectedBlock.label.split(' ').slice(1).join(' ');
    const date = new Date(selectedBlock.start * 1000).toLocaleDateString("en-US", { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return {
      title: `${dayLabel}, ${timeRange} UTC`,
      description: `${date} • ${selectedBlock.isRecent ? 'Latest stories (still receiving votes)' : 'Solidified stories'}`,
      storyCount: data?.hits.length || 0
    };
  };

  const blockInfo = selectedBlockInfo();

  if (error) {
    return (
      <div className="p-4">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-black">{blockInfo.title}</h3>
              <p className="text-xs text-gray-500">{blockInfo.description}</p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-8 text-red-600">
          <p className="text-sm">Failed to load stories. Please try again.</p>
          <Button 
            onClick={() => refetch()} 
            className="mt-2 bg-orange-500 hover:bg-orange-600 text-white text-xs"
            size="sm"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-black">{blockInfo.title}</h3>
              <p className="text-xs text-gray-500">{blockInfo.description}</p>
            </div>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading stories...</p>
        </div>
      </div>
    );
  }

  const stories = data?.hits || [];

  // Apply filters
  const filteredStories = stories.filter((story: Story, index: number) => {
    // Filter by minimum ranking (position in list)
    if (settings.minRanking > 0 && index + 1 > settings.minRanking) {
      return false;
    }
    
    // Filter by minimum points
    if (settings.minPoints > 0 && story.points < settings.minPoints) {
      return false;
    }
    
    return true;
  });

  const blockInfo = selectedBlockInfo();
  const filteredBlockInfo = {
    ...blockInfo,
    storyCount: filteredStories.length,
    originalCount: stories.length
  };

  return (
    <div className="p-4">
      {/* Selected Time Block Info */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-black">{filteredBlockInfo.title}</h3>
            <p className="text-xs text-gray-500">{filteredBlockInfo.description}</p>
          </div>
          <div className="text-xs text-gray-500">
            <span className="font-medium">{filteredBlockInfo.storyCount}</span> 
            {filteredBlockInfo.storyCount !== filteredBlockInfo.originalCount && (
              <span> of {filteredBlockInfo.originalCount}</span>
            )} stories
            {(settings.minRanking > 0 || settings.minPoints > 0) && (
              <div className="text-xs text-orange-600 mt-1">
                {settings.minRanking > 0 && `Top ${settings.minRanking} only`}
                {settings.minRanking > 0 && settings.minPoints > 0 && " • "}
                {settings.minPoints > 0 && `${settings.minPoints}+ points`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stories List */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">
            {stories.length === 0 
              ? "No stories found for this time block"
              : "No stories match your filter criteria"
            }
          </p>
          {stories.length > 0 && (
            <p className="text-xs mt-1 text-gray-400">
              Try adjusting your filters in settings
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {filteredStories.map((story: Story, index: number) => {
            const domain = extractDomain(story.url);
            const timeAgo = getTimeAgo(story.created_at_i);
            
            return (
              <div key={story.objectID} className="flex text-xs leading-4">
                <div className="w-6 text-gray-500 text-right mr-2 mt-1">{index + 1}.</div>
                <div className="flex-1">
                  <div className="flex items-start">
                    <Star className="w-3 h-3 text-gray-500 mt-1 mr-1 flex-shrink-0" fill="currentColor" />
                    <div>
                      <a 
                        href={story.url || `https://news.ycombinator.com/item?id=${story.objectID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black hover:underline font-medium visited:text-gray-500"
                      >
                        {story.title}
                      </a>
                      {domain && (
                        <span className="text-gray-500 ml-1">({domain})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-500 mt-1">
                    <span>{story.points} points</span> by{' '}
                    <a 
                      href={`https://news.ycombinator.com/user?id=${story.author}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {story.author}
                    </a>
                    <span> {timeAgo}</span> |{' '}
                    <a 
                      href={`https://news.ycombinator.com/item?id=${story.objectID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {story.num_comments} comments
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
