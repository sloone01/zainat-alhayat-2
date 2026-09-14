export type SolverSlot = {
  day: string;
  start_time: string;
  duration_minutes: number;
};

export type SolverLesson = {
  demand_id: string;
  group_id: string;
  course_id: string;
  teacher_id: string;
};

export type OccupiedInterval = {
  teacher_id: string;
  day: string;
  start_min: number;
  end_min: number;
};

export type SolverPlacement = {
  demand_id: string;
  group_id: string;
  course_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
};

export type SolverFail =
  | { ok: false; code: 'NO_SLOTS' }
  | { ok: false; code: 'NO_LESSONS' }
  | { ok: false; code: 'GROUP_OVERLOAD'; needed: number; available: number }
  | { ok: false; code: 'TEACHER_OVERLOAD'; teacher_id: string; needed: number; available: number }
  | { ok: false; code: 'UNSOLVABLE' };

export type SolverOk = { ok: true; placements: SolverPlacement[] };

export function hmToMinutes(hm: string): number {
  const raw = String(hm || '').trim();
  const parts = raw.slice(0, 5).split(':');
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return NaN;
  return h * 60 + m;
}

export function minutesToHm(total: number): string {
  const normalized = ((Math.round(total) % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function rangesOverlap(a0: number, a1: number, b0: number, b1: number): boolean {
  return a0 < b1 && b0 < a1;
}

type SlotRange = SolverSlot & {
  start_min: number;
  end_min: number;
  end_time: string;
};

function toSlotRange(slot: SolverSlot): SlotRange | null {
  const start_min = hmToMinutes(slot.start_time);
  const duration = Number(slot.duration_minutes);
  if (!Number.isFinite(start_min) || !Number.isFinite(duration) || duration <= 0) return null;
  const end_min = start_min + duration;
  return {
    day: slot.day,
    start_time: minutesToHm(start_min),
    duration_minutes: duration,
    start_min,
    end_min,
    end_time: minutesToHm(end_min),
  };
}

function teacherBusy(
  teacherId: string,
  slot: SlotRange,
  occupied: OccupiedInterval[],
  placed: SolverPlacement[],
): boolean {
  if (
    occupied.some(
      (block) =>
        block.teacher_id === teacherId &&
        block.day === slot.day &&
        rangesOverlap(block.start_min, block.end_min, slot.start_min, slot.end_min),
    )
  ) {
    return true;
  }
  return placed.some((row) => {
    if (row.teacher_id !== teacherId || row.day_of_week !== slot.day) return false;
    const start = hmToMinutes(row.start_time);
    const end = hmToMinutes(row.end_time);
    return rangesOverlap(start, end, slot.start_min, slot.end_min);
  });
}

function groupBusy(groupId: string, slot: SlotRange, placed: SolverPlacement[]): boolean {
  return placed.some((row) => {
    if (row.group_id !== groupId || row.day_of_week !== slot.day) return false;
    const start = hmToMinutes(row.start_time);
    const end = hmToMinutes(row.end_time);
    return rangesOverlap(start, end, slot.start_min, slot.end_min);
  });
}

const DAY_ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function hashId(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function dayIndex(day: string): number {
  const index = DAY_ORDER.indexOf(day);
  return index >= 0 ? index : 0;
}

function startsOnDay(slots: SlotRange[], day: string): number[] {
  return [...new Set(slots.filter((slot) => slot.day === day).map((slot) => slot.start_min))].sort(
    (a, b) => a - b,
  );
}

function isAdjacent(a: SlotRange, start: number, end: number): boolean {
  return a.end_min === start || end === a.start_min;
}

function slotPenalty(
  slot: SlotRange,
  lesson: SolverLesson,
  placed: SolverPlacement[],
  allSlots: SlotRange[],
  courseTotals: Map<string, number>,
  dayCount: number,
): number {
  const sameCourseDay = placed.filter(
    (row) =>
      row.course_id === lesson.course_id &&
      row.group_id === lesson.group_id &&
      row.day_of_week === slot.day,
  ).length;
  const sameCourseTime = placed.filter(
    (row) =>
      row.course_id === lesson.course_id &&
      row.group_id === lesson.group_id &&
      row.start_time === slot.start_time,
  ).length;
  const sameTeacherTime = placed.filter(
    (row) => row.teacher_id === lesson.teacher_id && row.start_time === slot.start_time,
  ).length;
  const dayLoad = placed.filter((row) => row.day_of_week === slot.day).length;
  const weekly = courseTotals.get(lesson.course_id) || 1;
  const softMax = Math.max(1, Math.ceil(weekly / Math.max(1, dayCount)));

  let penalty = sameCourseDay * 1000 + sameCourseTime * 400 + sameTeacherTime * 80 + dayLoad * 15;
  if (sameCourseDay >= softMax) penalty += 800;

  for (const row of placed) {
    if (row.day_of_week !== slot.day) continue;
    const start = hmToMinutes(row.start_time);
    const end = hmToMinutes(row.end_time);
    if (!isAdjacent(slot, start, end)) continue;
    if (row.course_id === lesson.course_id && row.group_id === lesson.group_id) penalty += 300;
    else if (row.teacher_id === lesson.teacher_id) penalty += 40;
  }

  const starts = startsOnDay(allSlots, slot.day);
  const periodIdx = Math.max(0, starts.indexOf(slot.start_min));
  const periodCount = Math.max(1, starts.length);
  const rotate = (periodIdx - dayIndex(slot.day) - (hashId(lesson.course_id) % periodCount) + periodCount * 4) %
    periodCount;
  penalty += rotate * 6;
  penalty += dayIndex(slot.day);

  return penalty;
}

function orderSlots(
  options: SlotRange[],
  lesson: SolverLesson,
  placed: SolverPlacement[],
  allSlots: SlotRange[],
  courseTotals: Map<string, number>,
  dayCount: number,
): SlotRange[] {
  return [...options].sort((a, b) => {
    const diff =
      slotPenalty(a, lesson, placed, allSlots, courseTotals, dayCount) -
      slotPenalty(b, lesson, placed, allSlots, courseTotals, dayCount);
    if (diff !== 0) return diff;
    if (a.day !== b.day) return dayIndex(a.day) - dayIndex(b.day);
    return a.start_min - b.start_min;
  });
}

function pickLessonIndex(
  remaining: SolverLesson[],
  optionCounts: number[],
  placed: SolverPlacement[],
): number {
  let bestIdx = 0;
  let bestCount = optionCounts[0] ?? Infinity;
  let bestPlaced = Infinity;
  for (let i = 0; i < remaining.length; i++) {
    const count = optionCounts[i];
    const already = placed.filter(
      (row) => row.course_id === remaining[i].course_id && row.group_id === remaining[i].group_id,
    ).length;
    if (count < bestCount || (count === bestCount && already < bestPlaced)) {
      bestCount = count;
      bestPlaced = already;
      bestIdx = i;
    }
  }
  return bestIdx;
}

export function solveTimetable(args: {
  lessons: SolverLesson[];
  slots: SolverSlot[];
  occupied: OccupiedInterval[];
  deadlineMs?: number;
}): SolverOk | SolverFail {
  const slots = args.slots.map(toSlotRange).filter((slot): slot is SlotRange => slot != null);
  if (!slots.length) return { ok: false, code: 'NO_SLOTS' };
  if (!args.lessons.length) return { ok: false, code: 'NO_LESSONS' };

  const needed = args.lessons.length;
  if (needed > slots.length) {
    return { ok: false, code: 'GROUP_OVERLOAD', needed, available: slots.length };
  }

  const teacherNeeded = new Map<string, number>();
  for (const lesson of args.lessons) {
    teacherNeeded.set(lesson.teacher_id, (teacherNeeded.get(lesson.teacher_id) || 0) + 1);
  }
  for (const [teacherId, count] of teacherNeeded) {
    const available = slots.filter((slot) => !teacherBusy(teacherId, slot, args.occupied, [])).length;
    if (count > available) {
      return { ok: false, code: 'TEACHER_OVERLOAD', teacher_id: teacherId, needed: count, available };
    }
  }

  const deadline = Date.now() + (args.deadlineMs ?? 2000);
  const placed: SolverPlacement[] = [];
  const dayCount = new Set(slots.map((slot) => slot.day)).size;
  const courseTotals = new Map<string, number>();
  for (const lesson of args.lessons) {
    courseTotals.set(lesson.course_id, (courseTotals.get(lesson.course_id) || 0) + 1);
  }

  const canPlace = (lesson: SolverLesson, slot: SlotRange) =>
    !teacherBusy(lesson.teacher_id, slot, args.occupied, placed) && !groupBusy(lesson.group_id, slot, placed);

  const search = (remaining: SolverLesson[]): boolean => {
    if (!remaining.length) return true;
    if (Date.now() > deadline) return false;

    const optionLists = remaining.map((lesson) => slots.filter((slot) => canPlace(lesson, slot)));
    const optionCounts = optionLists.map((list) => list.length);
    if (optionCounts.some((count) => count === 0)) return false;

    const bestIdx = pickLessonIndex(remaining, optionCounts, placed);
    const lesson = remaining[bestIdx];
    const rest = remaining.filter((_, i) => i !== bestIdx);
    for (const slot of orderSlots(optionLists[bestIdx], lesson, placed, slots, courseTotals, dayCount)) {
      placed.push({
        demand_id: lesson.demand_id,
        group_id: lesson.group_id,
        course_id: lesson.course_id,
        teacher_id: lesson.teacher_id,
        day_of_week: slot.day,
        start_time: slot.start_time,
        end_time: slot.end_time,
        duration_minutes: slot.duration_minutes,
      });
      if (search(rest)) return true;
      placed.pop();
    }
    return false;
  };

  if (!search([...args.lessons])) return { ok: false, code: 'UNSOLVABLE' };
  return { ok: true, placements: placed };
}
