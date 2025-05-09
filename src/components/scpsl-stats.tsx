import React, { useState, useEffect, useMemo, ChangeEvent, DragEvent } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Skull, Clock, Ghost, Upload, Moon, Sun, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseGameLog } from '@/lib/logParser';

interface Kill {
  timestamp: Date;
  victim: string;
  victimRole: string;
  killer: string;
  killerRole: string;
  deathReason: string;
}

interface GameStats {
  topKillers: [string, number][];
  roundDuration: number;
  scps: string[];
  winners: string[];
  killList: Kill[];
}


/**
 * Main component for displaying SCP:SL game statistics
 * Shows top killers, round winners, round info, and a kill feed
 */
const SCPSLStats = () => {
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [killFeed, setKillFeed] = useState<Kill[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const content = e.target?.result as string;
      if (content) {
        const stats = parseGameLog(content);
        setGameStats(stats);
        setKillFeed(stats.killList);
      }
      setIsLoading(false);
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.txt') || file.name.endsWith('.log'))) {
      processFile(file);
    }
  };

  const loadExampleLog = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/example.txt');
      const content = await response.text();
      const stats = parseGameLog(content);
      setGameStats(stats);
      setKillFeed(stats.killList);
    } catch (error) {
      console.error('Error loading example log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the formatted kill feed to prevent unnecessary re-renders
  const formattedKillFeed = useMemo(() => {
    return killFeed.map((kill, index) => {
      const getRoleColor = (role: string) => {
        const roleColors: Record<string, string> = {
          // SCP Classes
          'SCP-049': 'text-red-600',
          'SCP-049-2': 'text-red-400',
          'SCP-079': 'text-red-600',
          'SCP-096': 'text-red-600',
          'SCP-106': 'text-red-600',
          'SCP-173': 'text-red-600',
          'SCP-939': 'text-red-600',

          // Human Roles
          'Scientist': 'text-orange-400',
          'Facility Guard': 'text-grey-400',
          'Class-D Personnel': 'text-orange-900',
          'Nine-Tailed Fox': 'text-blue-800',
          'Chaos Insurgency Conscript': 'text-green-600',
          'Chaos Insurgency Repressor': 'text-green-600',
          'Chaos Insurgency Rifleman': 'text-green-600',
          'Chaos Insurgency Marauder': 'text-green-600',
          'Nine-Tailed Fox Sergeant': 'text-blue-800',
          'Nine-Tailed Fox Captain': 'text-blue-800',
          'Nine-Tailed Fox Private': 'text-blue-800',
          'Nine-Tailed Fox Specialist': 'text-blue-800',

          // Default
          'default': 'text-gray-600'
        };

        return roleColors[role] || roleColors['default'];
      };

      const victimColor = getRoleColor(kill.victimRole);
      const killerColor = getRoleColor(kill.killerRole);

      return (
        <div key={index} className="grid grid-cols-1 sm:grid-cols-6 items-center text-center p-2 rounded bg-gray-50 dark:bg-gray-800 gap-2">
          <div className="col-span-1 sm:col-span-2">
            <div className={`font-bold ${killerColor}`}>{kill.killer}</div>
            <div className={`text-sm ${killerColor}`}>({kill.killerRole})</div>
          </div>
          
          <div className="text-center">
            <span className="text-gray-500">killed</span>
          </div>
          
          <div className="col-span-1 sm:col-span-3">
            <div className={`font-bold ${victimColor}`}>{kill.victim}</div>
            <div className={`text-sm ${victimColor}`}>({kill.victimRole})</div>
            <div className={`text-sm ${victimColor}`}>{kill.deathReason}</div>
          </div>
        </div>
      );
    });
  }, [killFeed]);

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Theme Toggle and Example Log Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={loadExampleLog} disabled={isLoading}>
          <FileText className="h-4 w-4 mr-2" />
          Load Example Log
        </Button>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* File Upload */}
      <Card>
        <CardContent className="pt-6">
          <label 
            className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm text-gray-500">Drag and drop or click to select game log file</span>
            <input type="file" className="hidden" onChange={handleFileSelect} accept=".txt,.log" />
          </label>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center">
          <span className="text-gray-500">Loading...</span>
        </div>
      )}

      {gameStats && !isLoading && (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Top Killers */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skull className="h-6 w-6" /> Top Killers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gameStats.topKillers.map(([killer, kills], index) => (
                    <div key={killer} className="flex items-center justify-between">
                      <span className="font-medium">{index + 1}. {killer}</span>
                      <span className="text-muted-foreground">{kills} kills</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Round Winners */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6" /> Winners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {gameStats.winners.map(winner => (
                    <div key={winner} className="text-green-600 dark:text-green-400">
                      {winner}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Round Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 items-center text-center">
                  <Clock className="h-6 w-6" /> Round Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span>{gameStats.roundDuration} minutes</span>
                  </div>
                  <div className="flex items-center text-center gap-2 mt-4">
                    <Ghost className="h-5 w-5" />
                    <span className="font-medium items-center text-center">Active SCPs:</span>
                  </div>
                  <div className="items-center text-center space-y-1">
                    {gameStats.scps.map(scp => (
                      <div key={scp} className="items-center text-center text-red-600 dark:text-red-400">
                        {scp}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kill Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Skull className="h-6 w-6" /> Kill Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {formattedKillFeed}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SCPSLStats;