import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emotionalIntelligenceCourse,
  salesCoaching3Course,
  salesCoachingCourse,
  salesEngineeringCourse
} from "./courses";
import { isCourseId } from "./course-ids";

describe("course landing configurations", () => {
  it("uses unique course and video identifiers", () => {
    const courses = [
      emotionalIntelligenceCourse,
      salesEngineeringCourse,
      salesCoaching3Course,
      salesCoachingCourse
    ];

    assert.equal(new Set(courses.map((course) => course.id)).size, courses.length);
    assert.equal(
      new Set(courses.map((course) => course.videoId)).size,
      courses.length
    );
    assert.ok(courses.every((course) => isCourseId(course.id)));
  });

  it("keeps the existing root course packages unchanged", () => {
    assert.deepEqual(
      emotionalIntelligenceCourse.packages.map(({ price }) => price),
      ["550$", "750$", "850$", "1150$"]
    );
  });

  it("uses the online-only Sales Engineering package", () => {
    assert.equal(salesEngineeringCourse.videoId, "xBXgw_lOXjc");
    assert.deepEqual(
      salesEngineeringCourse.packages,
      [
        {
          title: "مسجّلة",
          price: "500$",
          benefits: ["النسخة المسجّلة من الدورة"]
        }
      ]
    );
    assert.doesNotMatch(JSON.stringify(salesEngineeringCourse), /حضوري/);
  });

  it("uses the online-only Sales Coaching package", () => {
    assert.equal(salesCoachingCourse.videoId, "GN4_UVtF-WQ");
    assert.deepEqual(
      salesCoachingCourse.packages,
      [
        {
          title: "أونلاين",
          price: "1,800$",
          benefits: ["الوصول أونلاين للبرنامج"]
        }
      ]
    );
    assert.doesNotMatch(JSON.stringify(salesCoachingCourse), /حضوري/);
  });

  it("uses the supplied video and online-only Sales Coaching 3 package", () => {
    assert.equal(salesCoaching3Course.videoId, "aPaSQEB_Kg4");
    assert.deepEqual(
      salesCoaching3Course.packages,
      [
        {
          title: "أونلاين",
          price: "1,490$",
          benefits: ["الوصول أونلاين إلى محتوى الدورة"]
        }
      ]
    );
    assert.doesNotMatch(JSON.stringify(salesCoaching3Course), /حضوري/);
  });
});
