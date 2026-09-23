import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { teachers } from "@/db/schema";

export async function findTeacherByEmail(email: string) {
  const [teacher] = await db
    .select()
    .from(teachers)
    .where(eq(teachers.email, email.trim().toLowerCase()));
  return teacher ?? null;
}

export async function findTeacherById(id: string) {
  const [teacher] = await db
    .select({
      id: teachers.id,
      name: teachers.name,
      email: teachers.email,
    })
    .from(teachers)
    .where(eq(teachers.id, id));
  return teacher ?? null;
}
