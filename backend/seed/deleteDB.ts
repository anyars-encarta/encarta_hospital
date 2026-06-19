import { db } from "../src/db/index.js";
import { account, session, user, verification } from "../src/db/schema/auth.js";
import { categories, paymentRecipients, payments, staff } from "../src/db/schema/app.js";

async function main() {
  await db.delete(paymentRecipients);
  // Other delete awaits for other tables can be added here if needed, but they are not necessary if there are no foreign key constraints.
  console.log("Database deletion completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Database deletion failed:", error);
    process.exit(1);
  });
