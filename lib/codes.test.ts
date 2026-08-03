import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLeadExportCsv } from "./codes";

describe("buildLeadExportCsv", () => {
  it("exports only phone and name in the requested order", () => {
    const results = [
      "name,phone,code,timestamp",
      "Ali,+9647000000000,abcd,2026-08-03T08:00:00.000Z"
    ].join("\n");

    assert.equal(
      buildLeadExportCsv(results),
      "\ufeffphone,name\n+9647000000000,Ali\n"
    );
  });

  it("preserves Arabic text and escapes CSV-sensitive characters", () => {
    const results = [
      "timestamp,phone,name,code",
      '2026-08-03T08:00:00.000Z,07800000000,"سارة، ""الراوي""",abcd',
      '2026-08-03T09:00:00.000Z,07900000000,"Line one\nLine two",efgh'
    ].join("\n");

    assert.equal(
      buildLeadExportCsv(results),
      [
        "\ufeffphone,name",
        '07800000000,"سارة، ""الراوي"""',
        '07900000000,"Line one\nLine two"',
        ""
      ].join("\n")
    );
  });

  it("returns a header-only export when there are no results", () => {
    assert.equal(buildLeadExportCsv(""), "\ufeffphone,name\n");
    assert.equal(
      buildLeadExportCsv("name,phone,code,timestamp\n"),
      "\ufeffphone,name\n"
    );
  });

  it("rejects results without the required columns", () => {
    assert.throws(
      () => buildLeadExportCsv("code,timestamp\nabcd,2026-08-03T08:00:00.000Z\n"),
      /must include name and phone headers/u
    );
  });
});
