/**
 * Per-student outcome for one online video session only.
 * Stored in `online_session_student_attendance` — not merged into daily `attendances`.
 */
export const OnlineSessionParticipation = {
  ATTENDED: 'attended',
  NOT_ATTENDED: 'not_attended',
  /** Before session is finalized (grace after schedule end) */
  PENDING: 'pending',
} as const;

export type OnlineSessionParticipationStatus =
  (typeof OnlineSessionParticipation)[keyof typeof OnlineSessionParticipation];

/** Legacy DB values before migration */
export function normalizeParticipationStatus(
  raw: string | undefined | null,
  sessionFinalized: boolean,
): OnlineSessionParticipationStatus {
  if (raw === OnlineSessionParticipation.ATTENDED || raw === 'present') {
    return OnlineSessionParticipation.ATTENDED;
  }
  if (raw === OnlineSessionParticipation.NOT_ATTENDED || raw === 'absent') {
    return OnlineSessionParticipation.NOT_ATTENDED;
  }
  if (raw === OnlineSessionParticipation.PENDING) {
    return OnlineSessionParticipation.PENDING;
  }
  return sessionFinalized
    ? OnlineSessionParticipation.NOT_ATTENDED
    : OnlineSessionParticipation.PENDING;
}
