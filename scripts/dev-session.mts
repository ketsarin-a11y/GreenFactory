// Dev helper: prints a session cookie for a seeded user so pages can be checked with curl.
//   npx tsx scripts/dev-session.mts manager@voltera.example
//   curl -s -b "gf_session=$(npx tsx scripts/dev-session.mts manager@voltera.example)" localhost:3000/manager
import { prisma } from "../prisma/seed/client";
import { signSession } from "../src/server/auth/session";

if (process.env.NODE_ENV === "production") throw new Error("dev only");
const email = process.argv[2];
const u = await prisma.user.findUniqueOrThrow({ where: { email } });
process.stdout.write(await signSession({ uid: u.userId, ver: u.sessionVersion }, 3600));
await prisma.$disconnect();
