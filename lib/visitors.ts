import { createHmac } from "node:crypto";
import { chmodSync, mkdirSync } from "node:fs";
import { isIP } from "node:net";
import path from "node:path";
import { DatabaseSync, type StatementSync } from "node:sqlite";

export const VISITORS_DATABASE_PATH = path.join(
  process.cwd(),
  "data",
  "visitors.sqlite"
);

const VISITOR_IP_HASH_KEY_PATTERN = /^[0-9a-f]{64}$/iu;
const VISITOR_HASH_PATTERN = /^[0-9a-f]{64}$/u;
const IPV4_MAPPED_IPV6_PATTERN = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/u;

export type VisitorRecord = {
  ipHash: string;
  firstSeenAt: string;
  lastSeenAt: string;
  viewCount: number;
};

export class VisitorStore {
  readonly #database: DatabaseSync;
  readonly #upsertVisitor: StatementSync;

  constructor(databasePath: string) {
    mkdirSync(path.dirname(databasePath), { recursive: true });

    this.#database = new DatabaseSync(databasePath);
    chmodSync(databasePath, 0o600);
    this.#database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA busy_timeout = 5000;

      CREATE TABLE IF NOT EXISTS visitors (
        ip_hash TEXT PRIMARY KEY
          CHECK(length(ip_hash) = 64 AND ip_hash NOT GLOB '*[^0-9a-f]*'),
        first_seen_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL,
        view_count INTEGER NOT NULL DEFAULT 1 CHECK(view_count >= 1)
      ) STRICT, WITHOUT ROWID;
    `);

    this.#upsertVisitor = this.#database.prepare(`
      INSERT INTO visitors (ip_hash, first_seen_at, last_seen_at, view_count)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(ip_hash) DO UPDATE SET
        first_seen_at = min(visitors.first_seen_at, excluded.first_seen_at),
        last_seen_at = max(visitors.last_seen_at, excluded.last_seen_at),
        view_count = visitors.view_count + 1
    `);
  }

  record(ipHash: string, seenAt: Date): void {
    if (!VISITOR_HASH_PATTERN.test(ipHash)) {
      throw new Error("Visitor hashes must be lowercase SHA-256 hexadecimal values.");
    }

    const timestamp = seenAt.toISOString();
    this.#upsertVisitor.run(ipHash, timestamp, timestamp);
  }

  loadAll(): VisitorRecord[] {
    const rows = this.#database
      .prepare(`
        SELECT
          ip_hash AS ipHash,
          first_seen_at AS firstSeenAt,
          last_seen_at AS lastSeenAt,
          view_count AS viewCount
        FROM visitors
        ORDER BY ip_hash
      `)
      .all();

    return rows.map((row) => ({
      ipHash: String(row.ipHash),
      firstSeenAt: String(row.firstSeenAt),
      lastSeenAt: String(row.lastSeenAt),
      viewCount: Number(row.viewCount)
    }));
  }

  close(): void {
    this.#database.close();
  }
}

let visitorStore: VisitorStore | null = null;

export function normalizeVisitorIp(rawIp: string | null | undefined): string | null {
  const ip = (rawIp ?? "").trim();

  if (!ip || ip.includes(",") || ip.includes("%")) {
    return null;
  }

  const version = isIP(ip);

  if (version === 4) {
    return ip
      .split(".")
      .map((octet) => String(Number(octet)))
      .join(".");
  }

  if (version !== 6) {
    return null;
  }

  const canonicalIp = new URL(`http://[${ip}]/`).hostname.slice(1, -1);
  const mappedIpv4 = IPV4_MAPPED_IPV6_PATTERN.exec(canonicalIp);

  if (mappedIpv4) {
    const highBytes = Number.parseInt(mappedIpv4[1], 16);
    const lowBytes = Number.parseInt(mappedIpv4[2], 16);

    return [
      highBytes >>> 8,
      highBytes & 0xff,
      lowBytes >>> 8,
      lowBytes & 0xff
    ].join(".");
  }

  return canonicalIp;
}

export function hashVisitorIp(normalizedIp: string, hashKey: string): string {
  if (!VISITOR_IP_HASH_KEY_PATTERN.test(hashKey)) {
    throw new Error(
      "VISITOR_IP_HASH_KEY must contain exactly 64 hexadecimal characters."
    );
  }

  return createHmac("sha256", Buffer.from(hashKey, "hex"))
    .update(normalizedIp)
    .digest("hex");
}

export function recordVisitor(normalizedIp: string, seenAt: Date): void {
  const validIp = normalizeVisitorIp(normalizedIp);

  if (!validIp) {
    return;
  }

  const hashKey = process.env.VISITOR_IP_HASH_KEY ?? "";
  const ipHash = hashVisitorIp(validIp, hashKey);

  visitorStore ??= new VisitorStore(VISITORS_DATABASE_PATH);
  visitorStore.record(ipHash, seenAt);
}
