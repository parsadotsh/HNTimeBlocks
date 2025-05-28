import { useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeBlock } from "@shared/schema";
import type { SettingsConfig } from "@/components/settings-modal";
import { generateTimeBlocks } from "@/lib/time-blocks";

interface TimeBlockNavigationProps {
  selectedBlock: TimeBlock | null;
  onBlockSelect: (block: TimeBlock) => void;
  settings: SettingsConfig;
}

export function TimeBlockNavigation({ selectedBlock, onBlockSelect, settings }: TimeBlockNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  // Generate time blocks client-side
  const timeBlocks = useMemo(() => generateTimeBlocks(), []);

  // Auto-scroll to the rightmost position on load
  useEffect(() => {
    if (timeBlocks && containerRef.current) {
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollLeft = containerRef.current.scrollWidth;
          checkScrollFades();
        }
      }, 100);
      
      // Select the most recent block by default
      if (!selectedBlock && timeBlocks.length > 0) {
        const mostRecentBlock = timeBlocks[timeBlocks.length - 1];
        onBlockSelect(mostRecentBlock);
      }
    }
  }, [timeBlocks, selectedBlock, onBlockSelect]);

  // Check scroll position and update fade visibility
  const checkScrollFades = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setShowLeftFade(scrollLeft > 0);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollFades);
      return () => container.removeEventListener('scroll', checkScrollFades);
    }
  }, []);

  return (
    <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-black">Time Blocks (UTC)</h2>
          <div className="text-xs text-gray-500">
            <span className="inline-block w-3 h-3 bg-red-300 mr-1 rounded"></span>
            Recent (active)
          </div>
        </div>
        
        <div className="relative overflow-visible">
          <div 
            ref={containerRef}
            className="flex space-x-2 overflow-x-auto overflow-y-visible scrollbar-hide scroll-smooth pt-[3.5px] pb-[3.5px] -mx-4 px-4"
            style={{
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            }}
          >
            {timeBlocks?.map((block) => {
              const isSelected = selectedBlock?.start === block.start;
              const timeRange = block.label.split(' ').slice(1).join(' ');
              const dayLabel = block.label.split(' ')[0];
              
              return (
                <Button
                  key={`${block.start}-${block.end}`}
                  variant="outline"
                  size="sm"
                  className={`
                    flex-shrink-0 px-3 py-2 h-auto border-2 text-xs font-medium transition-all hover:scale-105
                    ${(block.isRecent && settings.showRecentBlocks)
                      ? 'bg-red-300 border-red-300 text-white hover:bg-red-400' 
                      : isSelected
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-orange-500 hover:text-orange-500'
                    }
                    ${isSelected && !(block.isRecent && settings.showRecentBlocks) ? 'ring-2 ring-orange-300' : ''}
                    ${isSelected && (block.isRecent && settings.showRecentBlocks) ? 'ring-2 ring-red-200' : ''}
                  `}
                  onClick={() => onBlockSelect(block)}
                >
                  <div className="text-center">
                    <div className="font-bold">{dayLabel}</div>
                    <div className="text-xs opacity-90">{timeRange}</div>
                    <div className="text-xs opacity-75">{block.date}</div>
                  </div>
                </Button>
              );
            })}
          </div>
          
          {/* Scroll indicators */}
          <div 
            className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none transition-opacity duration-200 ${showRightFade ? 'opacity-100' : 'opacity-0'}`}
          />
          <div 
            className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none transition-opacity duration-200 ${showLeftFade ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      </div>
    </div>
  );
}