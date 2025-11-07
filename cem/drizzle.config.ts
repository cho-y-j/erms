import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/postgres";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations-pg",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
