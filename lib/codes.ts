import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type MappingEntry = {
  code: string;
  name: string;
  phone: string;
};

export type ResultEntry = {
  name: string;
  phone: string;
  code: string;
  timestamp: string;
};

export type ResultDeduplicationKey = "code" | "phone";

export const CODE_CHARSET = "abcdefghjkmnpqrstuvwxyz23456789";
export const CODE_LENGTH = 4;
export const DEFAULT_SOURCE_CSV = "/Users/admin/Downloads/Untitled spreadsheet - Sheet1 (1).csv";
export const DEFAULT_NAME_COLUMN = "الاسم";
export const DEFAULT_PHONE_COLUMN = "رقم الهاتف";
export const MAPPING_FILE_PATH = path.join(process.cwd(), "data", "mapping.csv");
export const RESULTS_FILE_PATH = path.join(process.cwd(), "data", "results.csv");

const BIDI_CONTROL_PATTERN = /[\u200e\u200f\u202a-\u202e\u2066-\u2069]/gu;

let cachedMapping: { mtimeMs: number; entries: Map<string, MappingEntry> } | null = null;

export function normalizeCode(rawCode: string | undefined | null): string {
  return (rawCode ?? "").trim().toLowerCase().slice(0, 64);
}

export function normalizeName(rawName: string | undefined | null): string {
  return (rawName ?? "").trim();
}

export function extractFirstName(rawName: string | undefined | null): string {
  const name = normalizeName(rawName);

  if (!name) {
    return "";
  }

  return name.split(/\s+/u)[0] ?? "";
}

export function normalizePhone(rawPhone: string | undefined | null): string {
  const value = (rawPhone ?? "")
    .normalize("NFKC")
    .replace(BIDI_CONTROL_PATTERN, "")
    .replace(/\s+/gu, "")
    .trim();

  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/gu, "");

  if (!digits) {
    return "";
  }

  if (value.startsWith("+")) {
    return `+${digits}`;
  }

  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }

  if (digits.length === 10) {
    return `0${digits}`;
  }

  return digits;
}

export function parseCsv(text: string): string[][] {
  const input = text.replace(/^\ufeff/u, "");

  if (!input) {
    return [];
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    pushField();

    if (row.length > 1 || row.some((cell) => cell.length > 0)) {
      rows.push(row);
    }

    row = [];
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (inQuotes) {
      if (character === '"') {
        if (input[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }

      continue;
    }

    if (character === '"') {
      inQuotes = true;
      continue;
    }

    if (character === ",") {
      pushField();
      continue;
    }

    if (character === "\n") {
      pushRow();
      continue;
    }

    if (character === "\r") {
      if (input[index + 1] === "\n") {
        index += 1;
      }

      pushRow();
      continue;
    }

    field += character;
  }

  if (field.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows;
}

export function serializeCsvRow(values: readonly string[]): string {
  return values
    .map((value) => {
      if (/["\n\r,]/u.test(value)) {
        return `"${value.replace(/"/gu, '""')}"`;
      }

      return value;
    })
    .join(",");
}

export function findHeaderIndex(headers: string[], targetHeader: string): number {
  const normalizedTarget = targetHeader.trim();

  return headers.findIndex((header) => header.trim() === normalizedTarget);
}

export function buildLeadExportCsv(resultsText: string): string {
  const rows = parseCsv(resultsText);
  const exportHeader = serializeCsvRow(["phone", "name"]);

  if (rows.length === 0) {
    return `\ufeff${exportHeader}\n`;
  }

  const [headers, ...records] = rows;
  const nameIndex = findHeaderIndex(headers, "name");
  const phoneIndex = findHeaderIndex(headers, "phone");

  if (nameIndex < 0 || phoneIndex < 0) {
    throw new Error("data/results.csv must include name and phone headers.");
  }

  const exportRows = records.map((record) =>
    serializeCsvRow([record[phoneIndex] ?? "", record[nameIndex] ?? ""])
  );

  return `\ufeff${[exportHeader, ...exportRows].join("\n")}\n`;
}

export async function loadLeadExportCsv(): Promise<string> {
  try {
    const resultsText = await fs.readFile(RESULTS_FILE_PATH, "utf8");
    return buildLeadExportCsv(resultsText);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return buildLeadExportCsv("");
    }

    throw error;
  }
}

export function generateCodeForPhone(phone: string, usedCodes: Set<string>): string {
  const codeBase = BigInt(CODE_CHARSET.length);

  for (let attempt = 0; attempt < 2048; attempt += 1) {
    const hash = createHash("sha256").update(`${phone}:${attempt}`).digest("hex");
    let value = BigInt(`0x${hash.slice(0, 16)}`);
    let code = "";

    for (let index = 0; index < CODE_LENGTH; index += 1) {
      code = `${CODE_CHARSET[Number(value % codeBase)]}${code}`;
      value /= codeBase;
    }

    if (!usedCodes.has(code)) {
      usedCodes.add(code);
      return code;
    }
  }

  throw new Error(`Unable to generate a unique code for phone ${phone}.`);
}

export async function lookupByCode(code: string): Promise<MappingEntry | null> {
  const normalizedCode = normalizeCode(code);

  if (!normalizedCode) {
    return null;
  }

  const entries = await loadMapping();
  return entries.get(normalizedCode) ?? null;
}

export async function appendResult(
  entry: ResultEntry,
  options: { deduplicateBy: ResultDeduplicationKey }
): Promise<{ appended: boolean }> {
  const normalizedEntry: ResultEntry = {
    name: normalizeName(entry.name),
    phone: normalizePhone(entry.phone),
    code: normalizeCode(entry.code),
    timestamp: entry.timestamp.trim()
  };

  const existingText = await ensureResultsFile();
  const existingRows = parseCsv(existingText);
  const headerRow = existingRows[0] ?? [];
  const deduplicationIndex = findHeaderIndex(headerRow, options.deduplicateBy);
  const deduplicationValue =
    options.deduplicateBy === "code" ? normalizedEntry.code : normalizedEntry.phone;

  if (deduplicationValue && deduplicationIndex >= 0) {
    for (const row of existingRows.slice(1)) {
      const existingValue =
        options.deduplicateBy === "code"
          ? normalizeCode(row[deduplicationIndex] ?? "")
          : normalizePhone(row[deduplicationIndex] ?? "");

      if (existingValue === deduplicationValue) {
        return { appended: false };
      }
    }
  }

  const line = `${serializeCsvRow([
    normalizedEntry.name,
    normalizedEntry.phone,
    normalizedEntry.code,
    normalizedEntry.timestamp
  ])}\n`;

  await fs.appendFile(RESULTS_FILE_PATH, line, "utf8");
  return { appended: true };
}

async function loadMapping(): Promise<Map<string, MappingEntry>> {
  try {
    const stats = await fs.stat(MAPPING_FILE_PATH);

    if (cachedMapping && cachedMapping.mtimeMs === stats.mtimeMs) {
      return cachedMapping.entries;
    }

    const text = await fs.readFile(MAPPING_FILE_PATH, "utf8");
    const rows = parseCsv(text);

    if (rows.length === 0) {
      cachedMapping = { mtimeMs: stats.mtimeMs, entries: new Map() };
      return cachedMapping.entries;
    }

    const [headers, ...records] = rows;
    const codeIndex = findHeaderIndex(headers, "code");
    const nameIndex = findHeaderIndex(headers, "name");
    const phoneIndex = findHeaderIndex(headers, "phone");

    if (codeIndex < 0 || nameIndex < 0 || phoneIndex < 0) {
      throw new Error("data/mapping.csv must include code,name,phone headers.");
    }

    const entries = new Map<string, MappingEntry>();

    for (const record of records) {
      const code = normalizeCode(record[codeIndex] ?? "");

      if (!code) {
        continue;
      }

      entries.set(code, {
        code,
        name: normalizeName(record[nameIndex] ?? ""),
        phone: normalizePhone(record[phoneIndex] ?? "")
      });
    }

    cachedMapping = { mtimeMs: stats.mtimeMs, entries };
    return entries;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      cachedMapping = null;
      return new Map();
    }

    throw error;
  }
}

async function ensureResultsFile(): Promise<string> {
  try {
    return await fs.readFile(RESULTS_FILE_PATH, "utf8");
  } catch (error) {
    if (!isNodeError(error) || error.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.mkdir(path.dirname(RESULTS_FILE_PATH), { recursive: true });

  const header = `${serializeCsvRow(["name", "phone", "code", "timestamp"])}\n`;
  await fs.writeFile(RESULTS_FILE_PATH, header, "utf8");
  return header;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === "object" && error !== null && "code" in error;
}
