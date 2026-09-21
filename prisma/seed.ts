import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function utcDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day));
}

async function main() {
  await prisma.win.deleteMany();
  await prisma.draw.deleteMany();
  await prisma.score.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.charityChoice.deleteMany();
  await prisma.charityEvent.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();
  await prisma.charity.deleteMany();

  const passwordHash = await bcrypt.hash("HeroPlay!26", 10);
  const adminHash = await bcrypt.hash("HeroAdmin!26", 10);

  const charities = await prisma.$transaction([
    prisma.charity.create({
      data: {
        slug: "fairway-futures",
        name: "Fairway Futures",
        tagline: "First clubs, first chances, for kids who never got a tee time.",
        description:
          "Fairway Futures funds coaching, kit, and travel for young people in state schools. Every subscription share buys a junior a season on the course — not as a luxury, but as a way to belong.",
        cause: "junior",
        accent: "#e8b86d",
        featured: true,
        events: {
          create: [
            {
              title: "East London Junior Open",
              happensOn: utcDate(2026, 10, 12),
              location: "Hackney Marshes Learning Course",
              description: "A 9-hole festival for 120 first-time players, with coaches and borrowed clubs on every tee.",
            },
            {
              title: "Winter kit drive",
              happensOn: utcDate(2026, 11, 8),
              location: "Community Hub, Stratford",
              description: "Waterproofs, gloves, and second-hand irons packed for the next school cohort.",
            },
          ],
        },
      },
    }),
    prisma.charity.create({
      data: {
        slug: "green-recovery-trust",
        name: "Green Recovery Trust",
        tagline: "Rewild the edges. Keep the game, give the land back.",
        description:
          "The Trust turns tired municipal land into wild corridors — pollinator strips, wetlands, and public walking loops that sit beside public courses without turning them into private parks.",
        cause: "environment",
        accent: "#7bc4a3",
        events: {
          create: [
            {
              title: "Heath planting weekend",
              happensOn: utcDate(2026, 10, 4),
              location: "North Downs public course",
              description: "Volunteers plant 2,000 native plugs along the out-of-play rough.",
            },
          ],
        },
      },
    }),
    prisma.charity.create({
      data: {
        slug: "heartline-hospice",
        name: "Heartline Hospice",
        tagline: "Quiet rooms, open gardens, care that stays overnight.",
        description:
          "Heartline funds respite beds and family rooms. A portion of every Heroes subscription keeps a nurse on a night shift and a garden door unlocked for people who need air at 2am.",
        cause: "health",
        accent: "#e85d75",
        events: {
          create: [
            {
              title: "Sunrise putting morning",
              happensOn: utcDate(2026, 9, 28),
              location: "Hospice garden green",
              description: "Patients, families, and staff play a short, seated putting round before breakfast.",
            },
          ],
        },
      },
    }),
    prisma.charity.create({
      data: {
        slug: "veterans-open",
        name: "Veterans' Open",
        tagline: "A round with people who already know the silence.",
        description:
          "Veterans' Open pays for adapted clubs, transport, and a weekly nine holes for service leavers. The game is the excuse. The company is the point.",
        cause: "veterans",
        accent: "#6ea8d8",
        events: {
          create: [
            {
              title: "Autumn pairs day",
              happensOn: utcDate(2026, 10, 18),
              location: "Aldershot municipal",
              description: "Scramble format, no handicaps announced, lunch included.",
            },
          ],
        },
      },
    }),
    prisma.charity.create({
      data: {
        slug: "community-links",
        name: "Community Links",
        tagline: "Street sport, borrowed time, a reason to show up on Tuesday.",
        description:
          "Community Links runs after-school sessions on public driving nets and park putting greens. The money covers coaches who stay after the bell and a minibus that actually arrives.",
        cause: "community",
        accent: "#c084fc",
      },
    }),
  ]);

  const [fairway, green, heartline, veterans] = charities;

  const admin = await prisma.user.create({
    data: {
      email: "admin@digitalheroes.test",
      name: "Amina Shah",
      role: "ADMIN",
      passwordHash: adminHash,
    },
  });

  const maya = await prisma.user.create({
    data: {
      email: "player@digitalheroes.test",
      name: "Maya Chen",
      passwordHash,
      charityChoice: { create: { charityId: fairway.id, percent: 15 } },
      subscription: {
        create: {
          plan: "MONTHLY",
          status: "ACTIVE",
          amountPence: 1200,
          renewalDate: utcDate(2026, 10, 21),
          mockPaymentId: "pay_maya_monthly",
        },
      },
      scores: {
        create: [
          { value: 35, playedOn: utcDate(2026, 9, 18) },
          { value: 28, playedOn: utcDate(2026, 9, 12) },
          { value: 41, playedOn: utcDate(2026, 8, 30) },
          { value: 31, playedOn: utcDate(2026, 8, 16) },
          { value: 24, playedOn: utcDate(2026, 8, 3) },
        ],
      },
    },
  });

  const jordan = await prisma.user.create({
    data: {
      email: "jordan@digitalheroes.test",
      name: "Jordan Hale",
      passwordHash,
      charityChoice: { create: { charityId: heartline.id, percent: 20 } },
      subscription: {
        create: {
          plan: "YEARLY",
          status: "ACTIVE",
          amountPence: 10800,
          renewalDate: utcDate(2027, 3, 2),
          mockPaymentId: "pay_jordan_yearly",
        },
      },
      scores: {
        create: [
          { value: 40, playedOn: utcDate(2026, 9, 14) },
          { value: 38, playedOn: utcDate(2026, 9, 6) },
          { value: 22, playedOn: utcDate(2026, 8, 22) },
          { value: 31, playedOn: utcDate(2026, 8, 9) },
          { value: 29, playedOn: utcDate(2026, 7, 28) },
        ],
      },
    },
  });

  const sam = await prisma.user.create({
    data: {
      email: "sam@digitalheroes.test",
      name: "Sam Okonkwo",
      passwordHash,
      charityChoice: { create: { charityId: veterans.id, percent: 10 } },
      subscription: {
        create: {
          plan: "MONTHLY",
          status: "ACTIVE",
          amountPence: 1200,
          renewalDate: utcDate(2026, 10, 8),
          mockPaymentId: "pay_sam_monthly",
        },
      },
      scores: {
        create: [
          { value: 18, playedOn: utcDate(2026, 9, 19) },
          { value: 24, playedOn: utcDate(2026, 9, 4) },
          { value: 27, playedOn: utcDate(2026, 8, 21) },
          { value: 21, playedOn: utcDate(2026, 8, 2) },
          { value: 33, playedOn: utcDate(2026, 7, 19) },
        ],
      },
    },
  });

  const riley = await prisma.user.create({
    data: {
      email: "riley@digitalheroes.test",
      name: "Riley Frost",
      passwordHash,
      charityChoice: { create: { charityId: green.id, percent: 25 } },
      subscription: {
        create: {
          plan: "MONTHLY",
          status: "ACTIVE",
          amountPence: 1200,
          renewalDate: utcDate(2026, 10, 1),
          mockPaymentId: "pay_riley_monthly",
        },
      },
      scores: {
        create: [
          { value: 12, playedOn: utcDate(2026, 9, 2) },
          { value: 24, playedOn: utcDate(2026, 8, 20) },
          { value: 31, playedOn: utcDate(2026, 8, 11) },
          { value: 38, playedOn: utcDate(2026, 7, 30) },
          { value: 7, playedOn: utcDate(2026, 7, 14) },
        ],
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "alex@digitalheroes.test",
      name: "Alex Rivera",
      passwordHash,
      charityChoice: { create: { charityId: fairway.id, percent: 10 } },
      subscription: {
        create: {
          plan: "MONTHLY",
          status: "LAPSED",
          amountPence: 1200,
          renewalDate: utcDate(2026, 8, 12),
          mockPaymentId: "pay_alex_lapsed",
        },
      },
      scores: {
        create: [{ value: 26, playedOn: utcDate(2026, 8, 1) }],
      },
    },
  });

  const august = await prisma.draw.create({
    data: {
      year: 2026,
      month: 8,
      type: "RANDOM",
      status: "PUBLISHED",
      numbersJson: JSON.stringify([12, 24, 31, 38, 41]),
      prizePoolPence: 1920,
      jackpotCarryPence: 0,
      simulatedAt: utcDate(2026, 8, 28),
      publishedAt: utcDate(2026, 8, 29),
    },
  });

  // Maya 3-match (24, 31, 41) — pending proof
  await prisma.win.create({
    data: {
      drawId: august.id,
      userId: maya.id,
      matchCount: 3,
      amountPence: 480,
      payoutStatus: "PENDING",
      proofStatus: "NONE",
    },
  });

  // Riley 4-match (12, 24, 31, 38) — verified and paid
  await prisma.win.create({
    data: {
      drawId: august.id,
      userId: riley.id,
      matchCount: 4,
      amountPence: 672,
      payoutStatus: "PAID",
      proofStatus: "APPROVED",
      proofNote: "Scorecard screenshot matches stored rounds.",
      reviewedAt: utcDate(2026, 9, 2),
      paidAt: utcDate(2026, 9, 4),
    },
  });

  await prisma.draw.create({
    data: {
      year: 2026,
      month: 9,
      type: "RANDOM",
      status: "DRAFT",
      numbersJson: "[]",
      prizePoolPence: 0,
      jackpotCarryPence: 768, // 40% of August pool unclaimed as 5-match
    },
  });

  await prisma.donation.create({
    data: {
      userId: jordan.id,
      charityId: heartline.id,
      email: jordan.email,
      amountPence: 2500,
      message: "For the night shift.",
    },
  });

  console.log("Seeded Digital Heroes demo data.");
  console.log("  Admin  admin@digitalheroes.test / HeroAdmin!26");
  console.log("  Player player@digitalheroes.test / HeroPlay!26");
  console.log(`  Users: admin=${admin.id} maya=${maya.id} jordan=${jordan.id} sam=${sam.id} riley=${riley.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
