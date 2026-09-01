export const COURSE_IDS = [
  "emotional-intelligence",
  "sales-engineering",
  "sales-coaching-4"
] as const;

export type CourseId = (typeof COURSE_IDS)[number];

export function isCourseId(value: string): value is CourseId {
  return COURSE_IDS.some((courseId) => courseId === value);
}
