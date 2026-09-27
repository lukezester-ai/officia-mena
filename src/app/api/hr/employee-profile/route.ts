import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  addEmployeeSkill,
  getEmployeeSkills,
  updateSkill,
  deleteSkill,
  addEmployeeEducation,
  getEmployeeEducation,
  updateEducation,
  deleteEducation,
  addWorkHistory,
  getWorkHistory,
  updateWorkHistory,
  deleteWorkHistory,
  getEmployeeProfile,
} from '@/lib/hr';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'skills') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const skills = await getEmployeeSkills(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: skills });
    }

    if (action === 'education') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const education = await getEmployeeEducation(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: education });
    }

    if (action === 'work-history') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const history = await getWorkHistory(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: history });
    }

    if (action === 'profile') {
      const employeeId = searchParams.get('employeeId');
      if (!employeeId) {
        return NextResponse.json({ success: false, error: 'Employee ID is required' }, { status: 400 });
      }

      const profile = await getEmployeeProfile(employeeId, tenant.id);
      return NextResponse.json({ success: true, data: profile });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'hr');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'add-skill') {
      const { employeeId, skillName, skillLevel, yearsOfExperience, lastUsed, isCertified, certificationName, certificationExpiry } = body;

      const skill = await addEmployeeSkill({
        tenantId: tenant.id,
        employeeId,
        skillName,
        skillLevel,
        yearsOfExperience,
        lastUsed: lastUsed ? new Date(lastUsed) : undefined,
        isCertified,
        certificationName,
        certificationExpiry: certificationExpiry ? new Date(certificationExpiry) : undefined,
      });

      return NextResponse.json({ success: true, data: skill });
    }

    if (action === 'add-education') {
      const { employeeId, institution, degree, fieldOfStudy, startDate, endDate, gpa, isHighest } = body;

      const education = await addEmployeeEducation({
        tenantId: tenant.id,
        employeeId,
        institution,
        degree,
        fieldOfStudy,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        gpa,
        isHighest,
      });

      return NextResponse.json({ success: true, data: education });
    }

    if (action === 'add-work-history') {
      const { employeeId, company, position, startDate, endDate, description, current } = body;

      const history = await addWorkHistory({
        tenantId: tenant.id,
        employeeId,
        company,
        position,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        description,
        current,
      });

      return NextResponse.json({ success: true, data: history });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'hr');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update-skill') {
      const { skillId, updates } = body;

      const skill = await updateSkill(skillId, tenant.id, updates);
      return NextResponse.json({ success: true, data: skill });
    }

    if (action === 'update-education') {
      const { educationId, updates } = body;

      const education = await updateEducation(educationId, tenant.id, updates);
      return NextResponse.json({ success: true, data: education });
    }

    if (action === 'update-work-history') {
      const { historyId, updates } = body;

      const history = await updateWorkHistory(historyId, tenant.id, updates);
      return NextResponse.json({ success: true, data: history });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'hr');
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'delete-skill') {
      const skillId = searchParams.get('skillId');
      if (!skillId) {
        return NextResponse.json({ success: false, error: 'Skill ID is required' }, { status: 400 });
      }

      await deleteSkill(skillId, tenant.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete-education') {
      const educationId = searchParams.get('educationId');
      if (!educationId) {
        return NextResponse.json({ success: false, error: 'Education ID is required' }, { status: 400 });
      }

      await deleteEducation(educationId, tenant.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete-work-history') {
      const historyId = searchParams.get('historyId');
      if (!historyId) {
        return NextResponse.json({ success: false, error: 'History ID is required' }, { status: 400 });
      }

      await deleteWorkHistory(historyId, tenant.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
