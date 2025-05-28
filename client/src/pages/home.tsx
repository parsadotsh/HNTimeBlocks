import { useState } from "react";
import { TimeBlockNavigation } from "@/components/time-block-navigation";
import { StoryList } from "@/components/story-list";
import { SettingsModal } from "@/components/settings-modal";
import { useSettings } from "@/hooks/use-settings";
import type { TimeBlock } from "@shared/schema";

export default function Home() {
  const [selectedBlock, setSelectedBlock] = useState<TimeBlock | null>(null);
  const { settings, updateSettings } = useSettings();

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="bg-hn-orange text-white">
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border border-white"></div>
                <span className="font-bold text-sm">HN Time Blocks</span>
              </div>
              <span className="text-xs opacity-75">Stories organized by 6-hour UTC blocks</span>
            </div>
            <SettingsModal settings={settings} onSettingsChange={updateSettings} />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto bg-white min-h-screen">
        {/* Time Block Navigation */}
        <TimeBlockNavigation 
          selectedBlock={selectedBlock}
          onBlockSelect={setSelectedBlock}
          settings={settings}
        />

        {/* Stories List */}
        <StoryList selectedBlock={selectedBlock} settings={settings} />

        {/* Footer */}
        <footer className="border-t border-gray-200 p-4 text-center">
          <div className="text-xs text-gray-500">
            <p>Data from <a href="https://hn.algolia.com/api" className="hover:underline text-hn-orange">Algolia HN API</a></p>
            <p className="mt-1">Stories organized by 6-hour UTC blocks • Refreshed every 10 minutes</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
