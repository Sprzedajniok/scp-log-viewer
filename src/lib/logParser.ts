/**
 * Types for the log parser
 */
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
 * Parses a game log file and extracts useful information
 * @param logContent - The content of the log file as a string
 * @returns Object containing game statistics like kills, winners, and round info
 */
export const parseGameLog = (logContent: string): GameStats => {
  const kills: Record<string, number> = {};
  const scps = new Set<string>();
  let roundStart: Date | null = null;
  let roundEnd: Date | null = null;
  let winners: string[] = [];
  const killList: Kill[] = [];

  const steamIdRegex = /\s*\((\d{17}@steam)\)/g;
  const logPrefixRegex = /^.*\|\s*(Kill|Round)\s*\|\s*([^|]+)\|\s*/;

  logContent.split('\n').forEach(line => {
    const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\.\d+Z?)/);
    const timestamp = timestampMatch ? timestampMatch[1] : null;

    line = line.replace(steamIdRegex, '').replace(logPrefixRegex, '');
    
    if (!timestamp) return;

    const parsedTimestamp = new Date(timestamp);
    
    if (line.includes('Round has been started')) {
      roundStart = parsedTimestamp;
    }
    if (line.includes('Round finished!')) {
      roundEnd = parsedTimestamp;
      const stats = line.match(/Anomalies: (\d+) \| Chaos: (\d+) \| Facility Forces: (\d+)/);
      if (stats) {
        const [_, anomalies, chaos, forces] = stats;
        if (parseInt(anomalies) > 0) winners.push('SCPs');
        if (parseInt(chaos) > 0) winners.push('Chaos Insurgency');
        if (parseInt(forces) > 0) winners.push('MTF');
      }
    }

    if (line.includes('has been killed by')) {
      const killMatch = line.match(/(.+?), playing as (.+?), has been killed by (.+?) playing as: (.+?)\. Specific death reason: (.+?)\.$/);
      if (killMatch) {
        const [_, victim, victimRole, killer, killerRole, deathReason] = killMatch;
        if (!kills[killer]) kills[killer] = 0;
        kills[killer]++;

        if (killerRole.startsWith('SCP-')) {
          scps.add(killerRole);
        }

        killList.push({
          timestamp: parsedTimestamp,
          victim,
          victimRole,
          killer,
          killerRole,
          deathReason
        });
      }
    }
  });

  const roundDuration = roundEnd && roundStart 
    ? Math.floor((roundEnd - roundStart) / 1000 / 60)
    : 0;

  const sortedKills = Object.entries(kills)
    .sort(([,a], [,b]) => b - a);

  return {
    topKillers: sortedKills,
    roundDuration,
    scps: Array.from(scps),
    winners,
    killList
  };
}; 