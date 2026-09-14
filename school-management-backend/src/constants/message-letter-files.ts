export const MESSAGE_LETTER_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const MESSAGE_LETTER_FILE_MAX_COUNT = 5;

export const MESSAGE_LETTER_FILE_ALLOWED_EXTS = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.png',
  '.jpg',
  '.jpeg',
] as const;

export const MESSAGE_LETTER_FILE_IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg']);

export const LETTER_FILE_PURPOSE = 'letter_file' as const;

export type LetterFileTokenClaims = {
  purpose: typeof LETTER_FILE_PURPOSE;
  fid: string;
};
