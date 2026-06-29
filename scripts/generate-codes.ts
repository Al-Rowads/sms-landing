import { promises as fs } from "node:fs";
import path from "node:path";
import {
  CODE_CHARSET,
  DEFAULT_NAME_COLUMN,
  DEFAULT_PHONE_COLUMN,
  DEFAULT_SOURCE_CSV,
  MAPPING_FILE_PATH,
  findHeaderIndex,
  generateCodeForPhone,
  normalizeName,
  normalizePhone,
  parseCsv,
  serializeCsvRow
} from "../lib/codes";

type Options = {
  inputPath: string;
  nameColumn: string;
  phoneColumn: string;
};

function parseArguments(argv: string[]): Options {
  const options: Options = {
    inputPath: DEFAULT_SOURCE_CSV,
    nameColumn: DEFAULT_NAME_COLUMN,
    phoneColumn: DEFAULT_PHONE_COLUMN
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    const value = argv[index + 1];

    if (argument === "--in" && value) {
      options.inputPath = value;
      index += 1;
      continue;
    }

    if (argument === "--name-col" && value) {
      options.nameColumn = value;
      index += 1;
      continue;
    }

    if (argument === "--phone-col" && value) {
      options.phoneColumn = value;
      index += 1;
      continue;
    }

    if (argument.startsWith("--")) {
      throw new Error(`Unknown or incomplete argument: ${argument}`);
    }
  }

  return options;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const sourcePath = path.resolve(options.inputPath);
  const sourceText = await fs.readFile(sourcePath, "utf8");
  const rows = parseCsv(sourceText);

  if (rows.length === 0) {
    throw new Error("The source CSV is empty.");
  }

  const [headers, ...records] = rows;
  const nameIndex = findHeaderIndex(headers, options.nameColumn);
  const phoneIndex = findHeaderIndex(headers, options.phoneColumn);

  if (nameIndex < 0 || phoneIndex < 0) {
    throw new Error(
      `Missing required columns. Found headers: ${headers.join(", ")}. Expected name column "${options.nameColumn}" and phone column "${options.phoneColumn}".`
    );
  }

  const uniqueLeads = new Map<string, { name: string; phone: string }>();

  for (const record of records) {
    const phone = normalizePhone(record[phoneIndex] ?? "");

    if (!phone) {
      continue;
    }

    const name = normalizeName(record[nameIndex] ?? "");
    const existing = uniqueLeads.get(phone);

    if (!existing) {
      uniqueLeads.set(phone, { name, phone });
      continue;
    }

    if (!existing.name && name) {
      uniqueLeads.set(phone, { name, phone });
    }
  }

  const usedCodes = new Set<string>();
  const leads = [...uniqueLeads.values()].sort((left, right) => left.phone.localeCompare(right.phone));
  const mappingRows = leads.map((lead) => ({
    code: generateCodeForPhone(lead.phone, usedCodes),
    name: lead.name,
    phone: lead.phone
  }));

  const csv = `${[
    serializeCsvRow(["code", "name", "phone"]),
    ...mappingRows.map((row) => serializeCsvRow([row.code, row.name, row.phone]))
  ].join("\n")}\n`;

  await fs.mkdir(path.dirname(MAPPING_FILE_PATH), { recursive: true });
  await fs.writeFile(MAPPING_FILE_PATH, csv, "utf8");

  console.log(
    `Generated ${mappingRows.length} unique codes in ${path.relative(process.cwd(), MAPPING_FILE_PATH)} using the ${CODE_CHARSET.length}-character alphabet.`
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
