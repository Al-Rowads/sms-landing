import type { Metadata } from "next";
import CourseLanding, { type CourseSearchParams } from "./course-landing";
import { emotionalIntelligenceCourse } from "@/lib/courses";

export const runtime = "nodejs";
export const metadata: Metadata = emotionalIntelligenceCourse.metadata;

export default function Home({
  searchParams
}: {
  searchParams: CourseSearchParams;
}) {
  return (
    <CourseLanding
      course={emotionalIntelligenceCourse}
      searchParams={searchParams}
    />
  );
}
