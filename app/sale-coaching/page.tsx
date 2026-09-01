import type { Metadata } from "next";
import CourseLanding, { type CourseSearchParams } from "../course-landing";
import { salesCoachingCourse } from "@/lib/courses";

export const runtime = "nodejs";
export const metadata: Metadata = salesCoachingCourse.metadata;

export default function SalesCoachingPage({
  searchParams
}: {
  searchParams: CourseSearchParams;
}) {
  return <CourseLanding course={salesCoachingCourse} searchParams={searchParams} />;
}
