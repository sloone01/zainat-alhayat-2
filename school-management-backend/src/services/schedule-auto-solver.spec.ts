import { solveTimetable } from './schedule-auto-solver';

describe('solveTimetable', () => {
  it('places lessons without teacher or group clashes', () => {
    const result = solveTimetable({
      lessons: [
        { demand_id: 'd1', group_id: 'g1', course_id: 'c1', teacher_id: 't1' },
        { demand_id: 'd1', group_id: 'g1', course_id: 'c1', teacher_id: 't1' },
        { demand_id: 'd2', group_id: 'g1', course_id: 'c2', teacher_id: 't2' },
      ],
      slots: [
        { day: 'sunday', start_time: '08:00', duration_minutes: 45 },
        { day: 'sunday', start_time: '08:45', duration_minutes: 45 },
        { day: 'monday', start_time: '08:00', duration_minutes: 45 },
      ],
      occupied: [],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.placements).toHaveLength(3);
    const keys = result.placements.map((row) => `${row.day_of_week}|${row.start_time}`);
    expect(new Set(keys).size).toBe(3);
    expect(result.placements.filter((row) => row.teacher_id === 't1')).toHaveLength(2);
  });

  it('fails when the group has more lessons than slots', () => {
    const result = solveTimetable({
      lessons: [
        { demand_id: 'd1', group_id: 'g1', course_id: 'c1', teacher_id: 't1' },
        { demand_id: 'd1', group_id: 'g1', course_id: 'c1', teacher_id: 't1' },
      ],
      slots: [{ day: 'sunday', start_time: '08:00', duration_minutes: 45 }],
      occupied: [],
    });
    expect(result).toEqual({ ok: false, code: 'GROUP_OVERLOAD', needed: 2, available: 1 });
  });

  it('allows school-wide load when each group fits the week', () => {
    const result = solveTimetable({
      lessons: [
        { demand_id: 'd1', group_id: 'g1', course_id: 'c1', teacher_id: 't1' },
        { demand_id: 'd2', group_id: 'g2', course_id: 'c1', teacher_id: 't1' },
      ],
      slots: [
        { day: 'sunday', start_time: '08:00', duration_minutes: 45 },
        { day: 'sunday', start_time: '08:45', duration_minutes: 45 },
      ],
      occupied: [],
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.placements).toHaveLength(2);
    expect(new Set(result.placements.map((row) => `${row.group_id}|${row.start_time}`)).size).toBe(2);
  });

  it('mixes daily order instead of repeating the same sequence', () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'];
    const starts = ['08:00', '08:45', '09:30', '10:15'];
    const courses = ['c1', 'c2', 'c3', 'c4'];
    const lessons = courses.flatMap((course_id, index) =>
      Array.from({ length: 5 }, () => ({
        demand_id: `d${index}`,
        group_id: 'g1',
        course_id,
        teacher_id: `t${index}`,
      })),
    );
    const slots = days.flatMap((day) =>
      starts.map((start_time) => ({ day, start_time, duration_minutes: 45 })),
    );
    const result = solveTimetable({ lessons, slots, occupied: [] });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const firstPeriod = days.map((day) => {
      const row = result.placements.find((item) => item.day_of_week === day && item.start_time === '08:00');
      return row?.course_id;
    });
    expect(new Set(firstPeriod).size).toBeGreaterThan(1);

    for (const course_id of courses) {
      const times = new Set(
        result.placements.filter((row) => row.course_id === course_id).map((row) => row.start_time),
      );
      expect(times.size).toBeGreaterThan(1);
    }

    for (const day of days) {
      const byTime = result.placements
        .filter((row) => row.day_of_week === day)
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      const stacked = byTime.filter(
        (row, index) => index > 0 && row.course_id === byTime[index - 1].course_id,
      );
      expect(stacked).toHaveLength(0);
    }
  });

  it('fails when another group already occupies the teacher', () => {
    const result = solveTimetable({
      lessons: [{ demand_id: 'd1', group_id: 'g1', course_id: 'c1', teacher_id: 't1' }],
      slots: [{ day: 'sunday', start_time: '08:00', duration_minutes: 45 }],
      occupied: [{ teacher_id: 't1', day: 'sunday', start_min: 8 * 60, end_min: 8 * 60 + 45 }],
    });
    expect(result).toEqual({
      ok: false,
      code: 'TEACHER_OVERLOAD',
      teacher_id: 't1',
      needed: 1,
      available: 0,
    });
  });
});
