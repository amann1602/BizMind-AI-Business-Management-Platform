const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");

if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, "utf8");
  const dbUrl = process.env.DATABASE_URL || "";
  const isPostgres = dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");

  if (isPostgres) {
    if (schema.includes('provider = "sqlite"')) {
      console.log("[prepare-db] Switching Prisma provider to postgresql for deployment/production...");
      schema = schema.replace(/provider\s*=\s*["']sqlite["']/, 'provider = "postgresql"');
      fs.writeFileSync(schemaPath, schema, "utf8");
    }
  } else {
    if (schema.includes('provider = "postgresql"')) {
      console.log("[prepare-db] Switching Prisma provider to sqlite for local/demo development...");
      schema = schema.replace(/provider\s*=\s*["']postgresql["']/, 'provider = "sqlite"');
      fs.writeFileSync(schemaPath, schema, "utf8");
    }
  }
}

try {
  console.log("[prepare-db] Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (error) {
  console.error("[prepare-db] Error generating Prisma client:", error.message);
  process.exit(1);
}
