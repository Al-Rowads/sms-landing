import type { Metadata } from "next";
import CourseLanding, { type CourseSearchParams } from "../course-landing";
import { salesEngineeringCourse } from "@/lib/courses";

export const runtime = "nodejs";
export const metadata: Metadata = salesEngineeringCourse.metadata;

export default function SalesEngineeringPage({
  searchParams
}: {
  searchParams: CourseSearchParams;
}) {
  return (
    <CourseLanding course={salesEngineeringCourse} searchParams={searchParams} />
  );
}
