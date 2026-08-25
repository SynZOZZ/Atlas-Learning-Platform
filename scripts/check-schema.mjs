import { readFile } from "node:fs/promises";
import { newDb } from "pg-mem";

const sql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const memory = newDb({ autoCreateForeignKeyIndices: true });
memory.public.none(sql);
const tables = memory.public.many("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
if (tables.length < 10) throw new Error(`Expected at least 10 tables, found ${tables.length}`);
console.log(`Schema validation passed with ${tables.length} tables.`);
