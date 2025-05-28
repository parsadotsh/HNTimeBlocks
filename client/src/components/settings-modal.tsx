import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings } from "lucide-react";

export interface SettingsConfig {
  minRanking: number;
  minPoints: number;
  showRecentBlocks: boolean;
}

interface SettingsModalProps {
  settings: SettingsConfig;
  onSettingsChange: (settings: SettingsConfig) => void;
}

export function SettingsModal({ settings, onSettingsChange }: SettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<SettingsConfig>(settings);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSettingsChange(localSettings);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setLocalSettings(settings);
    setIsOpen(false);
  };

  const setMinRanking = (value: number) => {
    setLocalSettings(prev => ({ ...prev, minRanking: value }));
  };

  const setMinPoints = (value: number) => {
    setLocalSettings(prev => ({ ...prev, minPoints: value }));
  };

  const clearFilters = () => {
    setLocalSettings(prev => ({ ...prev, minRanking: 0, minPoints: 0 }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-orange-600 p-2"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Minimum Ranking Filter */}
          <div className="space-y-3">
            <Label htmlFor="minRanking" className="text-sm font-medium">
              Filter stories by minimum ranking
            </Label>
            <div className="space-y-2">
              <Input
                id="minRanking"
                type="number"
                value={localSettings.minRanking}
                onChange={(e) => setMinRanking(parseInt(e.target.value) || 0)}
                className="w-full"
                min="0"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className={localSettings.minRanking === 0 && localSettings.minPoints === 0 ? "bg-orange-100" : ""}
                >
                  Clear filters
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinRanking(1)}
                  className={localSettings.minRanking === 1 ? "bg-orange-100" : ""}
                >
                  Top 1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinRanking(10)}
                  className={localSettings.minRanking === 10 ? "bg-orange-100" : ""}
                >
                  Top 10
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinRanking(20)}
                  className={localSettings.minRanking === 20 ? "bg-orange-100" : ""}
                >
                  Top 20
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinRanking(50)}
                  className={localSettings.minRanking === 50 ? "bg-orange-100" : ""}
                >
                  Top 50
                </Button>
              </div>
            </div>
          </div>

          {/* Minimum Points Filter */}
          <div className="space-y-3">
            <Label htmlFor="minPoints" className="text-sm font-medium">
              Filter stories by minimum points
            </Label>
            <div className="space-y-2">
              <Input
                id="minPoints"
                type="number"
                value={localSettings.minPoints}
                onChange={(e) => setMinPoints(parseInt(e.target.value) || 0)}
                className="w-full"
                min="0"
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinPoints(5)}
                  className={localSettings.minPoints === 5 ? "bg-orange-100" : ""}
                >
                  5+ points
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinPoints(10)}
                  className={localSettings.minPoints === 10 ? "bg-orange-100" : ""}
                >
                  10+ points
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinPoints(25)}
                  className={localSettings.minPoints === 25 ? "bg-orange-100" : ""}
                >
                  25+ points
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMinPoints(50)}
                  className={localSettings.minPoints === 50 ? "bg-orange-100" : ""}
                >
                  50+ points
                </Button>
              </div>
            </div>
          </div>

          {/* Show Recent Blocks Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="showRecentBlocks" className="text-sm font-medium">
              Show recent blocks (red highlight)
            </Label>
            <Switch
              id="showRecentBlocks"
              checked={localSettings.showRecentBlocks}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ ...prev, showRecentBlocks: checked }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-hn-orange hover:bg-orange-600">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}