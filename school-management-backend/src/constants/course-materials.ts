/** Shared constants for course kinds + material file allowlist */

export const COURSE_KINDS = ['milestone', 'graded', 'standalone'] as const;
export type CourseKind = (typeof COURSE_KINDS)[number];

export const COURSE_MATERIAL_MAX_BYTES = 20 * 1024 * 1024; // 20MB

export const COURSE_MATERIAL_ALLOWED_EXTS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.odt',
  '.ods',
  '.odp',
  '.txt',
  '.rtf',
  '.csv',
  '.zip',
  '.rar',
] as const;

export const COURSE_MATERIAL_ALLOWED_MIMES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'text/plain',
  'application/rtf',
  'text/rtf',
  'text/csv',
  'application/csv',
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/vnd.rar',
  'application/octet-stream', // browsers often send this for rar/zip/office
]);
