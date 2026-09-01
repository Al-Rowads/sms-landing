import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  hashVisitorIp,
  normalizeVisitorIp,
  VisitorStore
} from "./visitors";

const TEST_HASH_KEY = "11".repeat(32);

describe("normalizeVisitorIp", () => {
  it("normalizes IPv4, IPv6, and IPv4-mapped IPv6 addresses", () => {
    assert.equal(normalizeVisitorIp(" 192.0.2.128 "), "192.0.2.128");
    assert.equal(normalizeVisitorIp("2001:0db8:0:0:0:0:0:1"), "2001:db8::1");
    assert.equal(normalizeVisitorIp("::ffff:192.0.2.128"), "192.0.2.128");
    assert.equal(normalizeVisitorIp("::ffff:c000:0280"), "192.0.2.128");
  });

  it("rejects missing, malformed, chained, and zone-scoped addresses", () => {
    assert.equal(normalizeVisitorIp(null), null);
    assert.equal(normalizeVisitorIp("not-an-ip"), null);
    assert.equal(normalizeVisitorIp("192.0.2.1, 198.51.100.1"), null);
    assert.equal(normalizeVisitorIp("fe80::1%eth0"), null);
  });
});

describe("hashVisitorIp", () => {
  it("creates deterministic, key-specific hashes without retaining the IP", () => {
    const firstHash = hashVisitorIp("192.0.2.128", TEST_HASH_KEY);

    assert.match(firstHash, /^[0-9a-f]{64}$/u);
    assert.equal(firstHash, hashVisitorIp("192.0.2.128", TEST_HASH_KEY));
    assert.notEqual(firstHash, hashVisitorIp("192.0.2.128", "22".repeat(32)));
    assert.doesNotMatch(firstHash, /192\.0\.2\.128/u);
  });

  it("rejects missing or malformed hash keys", () => {
    assert.throws(() => hashVisitorIp("192.0.2.128", ""), /64 hexadecimal/u);
    assert.throws(
      () => hashVisitorIp("192.0.2.128", "z".repeat(64)),
      /64 hexadecimal/u
    );
  });
});

describe("VisitorStore", () => {
  it("upserts lifetime visitors while preserving the earliest timestamp", () => {
    const temporaryDirectory = mkdtempSync(path.join(tmpdir(), "sms-visitors-"));
    const databasePath = path.join(temporaryDirectory, "visitors.sqlite");

    try {
      const store = new VisitorStore(databasePath);

      try {
        const firstHash = hashVisitorIp("192.0.2.128", TEST_HASH_KEY);
        const secondHash = hashVisitorIp("2001:db8::1", TEST_HASH_KEY);

        store.record(firstHash, new Date("2026-08-18T08:00:00.000Z"));
        store.record(firstHash, new Date("2026-08-18T09:00:00.000Z"));
        store.record(firstHash, new Date("2026-08-18T07:00:00.000Z"));
        store.record(secondHash, new Date("2026-08-18T10:00:00.000Z"));

        assert.deepEqual(store.loadAll(), [
          {
            ipHash: firstHash,
            firstSeenAt: "2026-08-18T07:00:00.000Z",
            lastSeenAt: "2026-08-18T09:00:00.000Z",
            viewCount: 3
          },
          {
            ipHash: secondHash,
            firstSeenAt: "2026-08-18T10:00:00.000Z",
            lastSeenAt: "2026-08-18T10:00:00.000Z",
            viewCount: 1
          }
        ].sort((left, right) => left.ipHash.localeCompare(right.ipHash)));
      } finally {
        store.close();
      }

      const databaseContents = readFileSync(databasePath);
      assert.equal(databaseContents.includes(Buffer.from("192.0.2.128")), false);
      assert.equal(databaseContents.includes(Buffer.from("2001:db8::1")), false);
      assert.equal(statSync(databasePath).mode & 0o777, 0o600);
    } finally {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
