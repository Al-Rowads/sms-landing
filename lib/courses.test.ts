import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emotionalIntelligenceCourse,
  salesCoachingCourse,
  salesEngineeringCourse
} from "./courses";

describe("course landing configurations", () => {
  it("uses unique course and video identifiers", () => {
    const courses = [
      emotionalIntelligenceCourse,
      salesEngineeringCourse,
      salesCoachingCourse
    ];

    assert.equal(new Set(courses.map((course) => course.id)).size, courses.length);
    assert.equal(
      new Set(courses.map((course) => course.videoId)).size,
      courses.length
    );
  });

  it("keeps the existing root course packages unchanged", () => {
    assert.deepEqual(
      emotionalIntelligenceCourse.packages.map(({ price }) => price),
      ["550$", "750$", "850$", "1150$"]
    );
  });

  it("uses the verified Sales Engineering video and prices", () => {
    assert.equal(salesEngineeringCourse.videoId, "xBXgw_lOXjc");
    assert.deepEqual(
      salesEngineeringCourse.packages.map(({ title, price }) => [title, price]),
      [
        ["مسجّلة", "500$"],
        ["حضورية + مسجّلة", "700$"],
        ["الباقة الخاصة (VIP)", "1,400$"]
      ]
    );
  });

  it("uses the supplied Sales Coaching video and verified prices", () => {
    assert.equal(salesCoachingCourse.videoId, "GN4_UVtF-WQ");
    assert.deepEqual(
      salesCoachingCourse.packages.map(({ title, price }) => [title, price]),
      [
        ["حضوري", "1,600$"],
        ["حضوري + أونلاين", "1,800$"],
        ["الباقة الكاملة", "2,300$"]
      ]
    );
  });
});
