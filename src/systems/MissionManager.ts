import type { GameSave, MissionDef, MissionProgress, RunStats } from '../core/types';
import { MISSION_POOL, pickDailyMissions } from '../data/missions';

/**
 * Manages daily missions: rolling a fresh set each local day, applying run
 * results to progress, and awarding rewards exactly once (no duplicates).
 */
export class MissionManager {
  /** Returns today's date key using local time (YYYY-MM-DD). */
  static todayKey(now: Date = new Date()): string {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Ensure the save has missions for today. Regenerates when the stored date
   * differs from today. Mutates and returns the save's mission list.
   */
  static ensureDaily(save: GameSave, dateKey = MissionManager.todayKey()): MissionProgress[] {
    if (save.missionsDate === dateKey && save.missions.length > 0) {
      return save.missions;
    }
    const defs = pickDailyMissions(dateKey);
    save.missions = defs.map((d) => ({ id: d.id, progress: 0, completed: false, claimed: false }));
    save.missionsDate = dateKey;
    return save.missions;
  }

  static def(id: string): MissionDef | undefined {
    return MISSION_POOL.find((m) => m.id === id);
  }

  /** Apply the stats from a completed run to the current missions. */
  static applyRun(missions: MissionProgress[], stats: RunStats): void {
    for (const m of missions) {
      if (m.completed) continue;
      const def = MissionManager.def(m.id);
      if (!def) continue;
      let increment = 0;
      switch (def.metric) {
        case 'distance':
          increment = stats.distance;
          break;
        case 'coins':
          increment = stats.coins;
          break;
        case 'bones':
          increment = stats.bones;
          break;
        case 'jumps':
          increment = stats.jumps;
          break;
        case 'slides':
          increment = stats.slides;
          break;
        case 'laneChanges':
          increment = stats.laneChanges;
          break;
        case 'shieldsUsed':
          increment = stats.shieldsUsed;
          break;
        case 'runsNoHit':
          increment = !stats.hit ? 1 : 0;
          break;
      }
      m.progress = Math.min(def.target, m.progress + increment);
      if (m.progress >= def.target) m.completed = true;
    }
  }

  /**
   * Claim all completed-but-unclaimed missions. Returns the total reward and
   * marks them claimed so a reward can never be granted twice.
   */
  static claimCompleted(missions: MissionProgress[]): number {
    let reward = 0;
    for (const m of missions) {
      if (m.completed && !m.claimed) {
        const def = MissionManager.def(m.id);
        if (def) reward += def.reward;
        m.claimed = true;
      }
    }
    return reward;
  }
}
