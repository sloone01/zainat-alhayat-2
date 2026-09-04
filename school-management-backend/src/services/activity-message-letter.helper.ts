import type { Activity } from '../entities/activity.entity';
import type { SchoolMessageLetter } from '../entities/school-message-letter.entity';
import type { ParentApprovalLetterBundleDto } from '../dto/activity.dto';
import type { MeetingRoomInviteDto } from '../dto/meeting-room.dto';

export function audienceFromActivity(activity: Pick<Activity, 'group_id'>): MeetingRoomInviteDto {
  if (activity.group_id) {
    return { groupIds: [activity.group_id] };
  }
  return { allParents: true };
}

export function letterBundleFromEntity(letter: SchoolMessageLetter): ParentApprovalLetterBundleDto {
  return {
    en: {
      subject: letter.subject_en,
      body_html: letter.body_html_en,
      body_sms: letter.body_sms_en ?? '',
    },
    ar: {
      subject: letter.subject_ar,
      body_html: letter.body_html_ar,
      body_sms: letter.body_sms_ar ?? '',
    },
  };
}

export function applyLetterBundleToEntity(
  letter: SchoolMessageLetter,
  activity: Activity,
  bundle: ParentApprovalLetterBundleDto,
): void {
  letter.school_id = activity.school_id;
  letter.activity_id = activity.id;
  letter.title = activity.title.trim();
  letter.audience = audienceFromActivity(activity) as unknown as Record<string, unknown>;
  letter.subject_en = bundle.en.subject;
  letter.subject_ar = bundle.ar.subject;
  letter.body_html_en = bundle.en.body_html;
  letter.body_html_ar = bundle.ar.body_html;
  letter.body_sms_en = bundle.en.body_sms ?? null;
  letter.body_sms_ar = bundle.ar.body_sms ?? null;
}
