import bcrypt from "bcryptjs";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const adminEmail = String(process.env.ADMIN_EMAIL || "admin@example.com").toLowerCase();
const adminName = process.env.ADMIN_NAME || "Platform Owner";
const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const passwordHash = await bcrypt.hash(adminPassword, 12);
const client = new pg.Client({ connectionString });
await client.connect();

try {
  await client.query(
    "INSERT INTO users (email,password_hash,name,role,status) VALUES ($1,$2,$3,'admin','approved') ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,name=EXCLUDED.name,role='admin',status='approved',updated_at=NOW()",
    [adminEmail, passwordHash, adminName],
  );
  console.log(`Administrator account is ready: ${adminEmail}`);
} finally {
  await client.end();
}
