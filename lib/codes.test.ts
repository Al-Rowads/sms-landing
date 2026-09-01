import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLeadExportCsv,
  hasDuplicateResult,
  migrateResultsCsv,
  parseCsv
} from "./codes";

describe("buildLeadExportCsv", () => {
  it("exports course, phone, and name in the requested order", () => {
    const results = [
      "name,phone,code,course,timestamp",
      "Ali,+9647000000000,abcd,sales-engineering,2026-08-03T08:00:00.000Z"
    ].join("\n");

    assert.equal(
      buildLeadExportCsv(results),
      "\ufeffcourse,phone,name\nsales-engineering,+9647000000000,Ali\n"
    );
  });

  it("preserves Arabic text and escapes CSV-sensitive characters", () => {
    const results = [
      "timestamp,phone,name,course,code",
      '2026-08-03T08:00:00.000Z,07800000000,"سارة، ""الراوي""",sales-engineering,abcd',
      '2026-08-03T09:00:00.000Z,07900000000,"Line one\nLine two",sales-coaching-4,efgh'
    ].join("\n");

    assert.equal(
      buildLeadExportCsv(results),
      [
        "\ufeffcourse,phone,name",
        'sales-engineering,07800000000,"سارة، ""الراوي"""',
        'sales-coaching-4,07900000000,"Line one\nLine two"',
        ""
      ].join("\n")
    );
  });

  it("returns a header-only export when there are no results", () => {
    assert.equal(buildLeadExportCsv(""), "\ufeffcourse,phone,name\n");
    assert.equal(
      buildLeadExportCsv("name,phone,code,course,timestamp\n"),
      "\ufeffcourse,phone,name\n"
    );
  });

  it("attributes legacy rows to the root course when exporting", () => {
    assert.equal(
      buildLeadExportCsv(
        "name,phone,code,timestamp\nAli,07800000000,abcd,2026-08-03T08:00:00.000Z\n"
      ),
      "\ufeffcourse,phone,name\nemotional-intelligence,07800000000,Ali\n"
    );
  });

  it("rejects results without the required columns", () => {
    assert.throws(
      () => buildLeadExportCsv("code,timestamp\nabcd,2026-08-03T08:00:00.000Z\n"),
      /must include name and phone headers/u
    );
  });
});

describe("migrateResultsCsv", () => {
  it("adds the course column and preserves legacy records", () => {
    const legacy = [
      "name,phone,code,timestamp",
      '"سارة، الراوي",07800000000,abcd,2026-08-03T08:00:00.000Z'
    ].join("\n");

    assert.deepEqual(migrateResultsCsv(legacy), {
      migrated: true,
      text: [
        "name,phone,code,course,timestamp",
        "سارة، الراوي,07800000000,abcd,emotional-intelligence,2026-08-03T08:00:00.000Z",
        ""
      ].join("\n")
    });
  });

  it("leaves a canonical results file unchanged", () => {
    const canonical = [
      "name,phone,code,course,timestamp",
      "Ali,07800000000,abcd,sales-engineering,2026-08-03T08:00:00.000Z",
      ""
    ].join("\n");

    assert.deepEqual(migrateResultsCsv(canonical), {
      migrated: false,
      text: canonical
    });
  });

  it("rejects unknown course values without rewriting them", () => {
    assert.throws(
      () =>
        migrateResultsCsv(
          "name,phone,code,course,timestamp\nAli,07800000000,abcd,unknown,2026-08-03T08:00:00.000Z\n"
        ),
      /unknown course/u
    );
  });
});

describe("hasDuplicateResult", () => {
  const rows = parseCsv(
    [
      "name,phone,code,course,timestamp",
      "Ali,07800000000,abcd,sales-engineering,2026-08-03T08:00:00.000Z"
    ].join("\n")
  );

  it("deduplicates the same identity within one course", () => {
    assert.equal(
      hasDuplicateResult(
        rows,
        {
          code: "ABCD",
          phone: "",
          course: "sales-engineering"
        },
        "code"
      ),
      true
    );
  });

  it("allows the same identity to submit for a different course", () => {
    assert.equal(
      hasDuplicateResult(
        rows,
        {
          code: "abcd",
          phone: "",
          course: "sales-coaching-4"
        },
        "code"
      ),
      false
    );
  });
});
