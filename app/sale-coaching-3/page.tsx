import type { Metadata } from "next";
import CourseLanding, { type CourseSearchParams } from "../course-landing";
import { salesCoaching3Course } from "@/lib/courses";

export const runtime = "nodejs";
export const metadata: Metadata = salesCoaching3Course.metadata;

export default function SalesCoaching3Page({
  searchParams
}: {
  searchParams: CourseSearchParams;
}) {
  return (
    <CourseLanding course={salesCoaching3Course} searchParams={searchParams} />
  );
}
