import { seed } from "../../scripts/seed";
import { closeDatabase } from "../config/database";

export { seed };

if (require.main === module) {
  seed().catch(async (err) => {
    console.error("Seed failed:", err instanceof Error ? err.message : err);
    await closeDatabase().catch(() => undefined);
    process.exit(1);
  });
}
