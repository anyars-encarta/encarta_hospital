import { readFile } from "node:fs/promises";

import { eq } from "drizzle-orm";

import { db } from "../src/db/index.js";
import {
  categories,
  paymentRecipients,
  payments,
  staff,
} from "../src/db/schema/app.js";

type SeedData = {
  
};

async function loadSeedData(): Promise<SeedData> {
  const raw = await readFile(new URL("./data.json", import.meta.url), "utf8");
  return JSON.parse(raw) as SeedData;
}

async function clearTables() {
  
}

async function main() {
  const data = await loadSeedData();

  await clearTables();



  console.log("Data seed completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Data seed failed:", error);
    process.exit(1);
  });
