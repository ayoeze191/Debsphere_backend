import "dotenv/config";
import bcrypt from "bcrypt";
import { Prisma } from "../src/prisma/client.js";

const instructorEmail = "instructor@lendly.dev";
const studentEmail = "student@lendly.dev";
const courseSlug = "complete-typescript-for-beginners";

// Public Apple test HLS stream — just for local/dev seeding so the video
// player has something real to load. Swap for your own once you have
// actual uploaded/transcoded lessons.
const TEST_HLS_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const instructor = await Prisma.user.upsert({
    where: { email: instructorEmail },
    update: {
      firstName: "Ada",
      lastName: "Okafor",
      role: "INSTRUCTOR",
    },
    create: {
      firstName: "Ada",
      lastName: "Okafor",
      email: instructorEmail,
      password: passwordHash,
      role: "INSTRUCTOR",
      provider: "LOCAL",
    },
  });

  // Adjust "STUDENT" if your Role enum names it differently.
  const student = await Prisma.user.upsert({
    where: { email: studentEmail },
    update: {
      firstName: "Chidi",
      lastName: "Umeh",
      role: "STUDENT",
    },
    create: {
      firstName: "Chidi",
      lastName: "Umeh",
      email: studentEmail,
      password: passwordHash,
      role: "STUDENT",
      provider: "LOCAL",
    },
  });

  const category = await Prisma.category.upsert({
    where: { name: "Software Development" },
    update: {},
    create: { name: "Software Development" },
  });

  let course = await Prisma.course.findUnique({
    where: { slug: courseSlug },
    include: {
      sections: {
        orderBy: { position: "asc" },
        include: {
          lessons: { orderBy: { position: "asc" }, include: { video: true } },
        },
      },
    },
  });

  if (course) {
    await Prisma.course.update({
      where: { id: course.id },
      data: {
        instructorId: instructor.id,
        categoryId: category.id,
        isPublished: true,
      },
    });
    console.log(`Course already exists: ${course.title}`);
  } else {
    course = await Prisma.course.create({
      data: {
        title: "Complete TypeScript for Beginners",
        slug: courseSlug,
        description:
          "Learn TypeScript fundamentals and build confidence writing safer JavaScript applications.",
        thumbnail:
          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=80",
        price: 8000,
        isPublished: true,
        duration: "6 Weeks",
        outcomes: [
          "Understand TypeScript fundamentals",
          "Write type-safe JavaScript applications",
          "Build reusable interfaces and generics",
          "Configure TypeScript projects from scratch",
          "Develop a complete TypeScript application",
        ],
        instructorId: instructor.id,
        categoryId: category.id,
        sections: {
          create: [
            {
              title: "Getting Started",
              position: 1,
              lessons: {
                create: [
                  {
                    title: "Welcome to the course",
                    description:
                      "What you will learn and how to use this course.",
                    duration: 180,
                    position: 1,
                    // First lesson gets a real playable video so the learn
                    // page's player has something to render end to end.
                    video: {
                      create: {
                        originalUrl: TEST_HLS_URL,
                        hlsUrl: TEST_HLS_URL,
                        thumbnail:
                          "https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=800&q=80",
                        status: "READY",
                      },
                    },
                  },
                  {
                    title: "Setting up TypeScript",
                    description:
                      "Install Node.js, TypeScript, and configure your first project.",
                    duration: 420,
                    position: 2,
                  },
                ],
              },
            },
            {
              title: "TypeScript Fundamentals",
              position: 2,
              lessons: {
                create: [
                  {
                    title: "Types and Type Inference",
                    description:
                      "Use primitive types, arrays, and inferred values.",
                    duration: 600,
                    position: 1,
                  },
                  {
                    title: "Interfaces and Objects",
                    description:
                      "Model reliable object shapes with interfaces.",
                    duration: 540,
                    position: 2,
                  },
                  {
                    title: "Functions and Generics",
                    description: "Write reusable, strongly typed functions.",
                    duration: 720,
                    position: 3,
                  },
                ],
              },
            },
            {
              title: "Building a Small Project",
              position: 3,
              lessons: {
                create: [
                  {
                    title: "Planning the Project",
                    description: "Define the data structures and the app flow.",
                    duration: 360,
                    position: 1,
                  },
                  {
                    title: "Putting It All Together",
                    description:
                      "Build and review a small TypeScript application.",
                    duration: 900,
                    position: 2,
                  },
                ],
              },
            },
          ],
        },
      },
      include: {
        sections: {
          orderBy: { position: "asc" },
          include: {
            lessons: { orderBy: { position: "asc" }, include: { video: true } },
          },
        },
      },
    });
  }

  const lessonCount = course.sections.reduce(
    (total, s) => total + s.lessons.length,
    0,
  );
  console.log(
    `Course "${course.title}" has ${course.sections.length} sections and ${lessonCount} lessons.`,
  );

  // If we loaded an existing course whose seed lesson has no video yet
  // (e.g. schema was added after the course was first seeded), attach one.
  const firstLesson = course.sections[0]?.lessons[0];
  if (firstLesson && !firstLesson.video) {
    await Prisma.video.create({
      data: {
        originalUrl: TEST_HLS_URL,
        hlsUrl: TEST_HLS_URL,
        thumbnail: course.thumbnail,
        status: "READY",
        lesson: { connect: { id: firstLesson.id } },
      },
    });
    console.log(`Attached test video to "${firstLesson.title}".`);
  }

  // Flatten lessons in curriculum order so we can pick "completed so far"
  // and "last lesson" deterministically.
  const flatLessons = course.sections.flatMap((s) => s.lessons);
  const completedSoFar = flatLessons.slice(0, 1); // just the welcome lesson
  const lastLessonId = flatLessons[1]?.id ?? flatLessons[0]?.id; // "Setting up TypeScript"

  // Enrollment — the student is partway through the course.
  await Prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {
      completedLessons: completedSoFar.length,
      totalLessons: flatLessons.length,
      lastLessonId,
    },
    create: {
      userId: student.id,
      courseId: course.id,
      completedLessons: completedSoFar.length,
      totalLessons: flatLessons.length,
      lastLessonId,
    },
  });

  // LessonProgress — mark the first lesson watched + completed for the student.
  for (const lesson of completedSoFar) {
    await Prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: student.id, lessonId: lesson.id } },
      update: { watched: true, completedAt: new Date() },
      create: {
        userId: student.id,
        lessonId: lesson.id,
        watched: true,
        completedAt: new Date(),
      },
    });
  }

  console.log(
    `Enrolled ${student.email} in "${course.title}" — ${completedSoFar.length}/${flatLessons.length} lessons complete, resuming at "${flatLessons[1]?.title ?? flatLessons[0]?.title}".`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Failed to seed the database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await Prisma.$disconnect();
  });
