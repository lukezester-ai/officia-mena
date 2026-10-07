import { db } from '@/lib/db/db';
import {
  employeeSkills,
  employeeEducation,
  employeeWorkHistory,
} from '@/lib/db/schema/hr_extensions';
import { eq, and, desc } from 'drizzle-orm';

const toDateString = (date: Date) => date.toISOString().slice(0, 10);

export interface SkillInput {
  tenantId: string;
  employeeId: string;
  skillName: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
  lastUsed?: Date;
  isCertified?: boolean;
  certificationName?: string;
  certificationExpiry?: Date;
}

export async function addEmployeeSkill(input: SkillInput) {
  const [skill] = await db
    .insert(employeeSkills)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      skillName: input.skillName,
      skillLevel: input.skillLevel,
      yearsOfExperience: input.yearsOfExperience || 0,
      lastUsed: input.lastUsed ? toDateString(input.lastUsed) : undefined,
      isCertified: input.isCertified || false,
      certificationName: input.certificationName,
      certificationExpiry: input.certificationExpiry ? toDateString(input.certificationExpiry) : undefined,
    })
    .returning();

  return skill;
}

export async function getEmployeeSkills(employeeId: string, tenantId: string) {
  return db
    .select()
    .from(employeeSkills)
    .where(and(eq(employeeSkills.employeeId, employeeId), eq(employeeSkills.tenantId, tenantId)))
    .orderBy(employeeSkills.skillName);
}

export async function updateSkill(skillId: string, tenantId: string, updates: Partial<SkillInput>) {
  const [skill] = await db
    .update(employeeSkills)
    .set({
      skillName: updates.skillName,
      skillLevel: updates.skillLevel,
      yearsOfExperience: updates.yearsOfExperience,
      lastUsed: updates.lastUsed ? toDateString(updates.lastUsed) : undefined,
      isCertified: updates.isCertified,
      certificationName: updates.certificationName,
      certificationExpiry: updates.certificationExpiry ? toDateString(updates.certificationExpiry) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(employeeSkills.id, skillId), eq(employeeSkills.tenantId, tenantId)))
    .returning();

  return skill;
}

export async function deleteSkill(skillId: string, tenantId: string) {
  await db
    .delete(employeeSkills)
    .where(and(eq(employeeSkills.id, skillId), eq(employeeSkills.tenantId, tenantId)));
}

export interface EducationInput {
  tenantId: string;
  employeeId: string;
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: Date;
  endDate: Date;
  gpa?: number;
  isHighest?: boolean;
}

export async function addEmployeeEducation(input: EducationInput) {
  const [education] = await db
    .insert(employeeEducation)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      institution: input.institution,
      degree: input.degree,
      fieldOfStudy: input.fieldOfStudy,
      startDate: toDateString(input.startDate),
      endDate: toDateString(input.endDate),
      gpa: input.gpa?.toFixed(2),
      isHighest: input.isHighest || false,
    })
    .returning();

  return education;
}

export async function getEmployeeEducation(employeeId: string, tenantId: string) {
  return db
    .select()
    .from(employeeEducation)
    .where(and(eq(employeeEducation.employeeId, employeeId), eq(employeeEducation.tenantId, tenantId)))
    .orderBy(desc(employeeEducation.endDate));
}

export async function updateEducation(educationId: string, tenantId: string, updates: Partial<EducationInput>) {
  const [education] = await db
    .update(employeeEducation)
    .set({
      institution: updates.institution,
      degree: updates.degree,
      fieldOfStudy: updates.fieldOfStudy,
      startDate: updates.startDate ? toDateString(updates.startDate) : undefined,
      endDate: updates.endDate ? toDateString(updates.endDate) : undefined,
      gpa: updates.gpa?.toFixed(2),
      isHighest: updates.isHighest,
      updatedAt: new Date(),
    })
    .where(and(eq(employeeEducation.id, educationId), eq(employeeEducation.tenantId, tenantId)))
    .returning();

  return education;
}

export async function deleteEducation(educationId: string, tenantId: string) {
  await db
    .delete(employeeEducation)
    .where(and(eq(employeeEducation.id, educationId), eq(employeeEducation.tenantId, tenantId)));
}

export interface WorkHistoryInput {
  tenantId: string;
  employeeId: string;
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description?: string;
  current?: boolean;
}

export async function addWorkHistory(input: WorkHistoryInput) {
  const [history] = await db
    .insert(employeeWorkHistory)
    .values({
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      company: input.company,
      position: input.position,
      startDate: toDateString(input.startDate),
      endDate: input.endDate ? toDateString(input.endDate) : undefined,
      description: input.description,
      current: input.current || false,
    })
    .returning();

  return history;
}

export async function getWorkHistory(employeeId: string, tenantId: string) {
  return db
    .select()
    .from(employeeWorkHistory)
    .where(and(eq(employeeWorkHistory.employeeId, employeeId), eq(employeeWorkHistory.tenantId, tenantId)))
    .orderBy(desc(employeeWorkHistory.startDate));
}

export async function updateWorkHistory(historyId: string, tenantId: string, updates: Partial<WorkHistoryInput>) {
  const [history] = await db
    .update(employeeWorkHistory)
    .set({
      company: updates.company,
      position: updates.position,
      startDate: updates.startDate ? toDateString(updates.startDate) : undefined,
      endDate: updates.endDate ? toDateString(updates.endDate) : undefined,
      description: updates.description,
      current: updates.current,
      updatedAt: new Date(),
    })
    .where(and(eq(employeeWorkHistory.id, historyId), eq(employeeWorkHistory.tenantId, tenantId)))
    .returning();

  return history;
}

export async function deleteWorkHistory(historyId: string, tenantId: string) {
  await db
    .delete(employeeWorkHistory)
    .where(and(eq(employeeWorkHistory.id, historyId), eq(employeeWorkHistory.tenantId, tenantId)));
}

export async function getEmployeeProfile(employeeId: string, tenantId: string) {
  const [skills, education, workHistory] = await Promise.all([
    getEmployeeSkills(employeeId, tenantId),
    getEmployeeEducation(employeeId, tenantId),
    getWorkHistory(employeeId, tenantId),
  ]);

  return {
    skills,
    education,
    workHistory,
  };
}
