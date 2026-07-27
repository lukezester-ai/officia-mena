'use server'

import { db } from '@/lib/db/db';
import { clients } from '@/lib/db/schema/clients';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createClient(formData: FormData) {
  const tenant = await requireTenant();
  
  const companyName = formData.get('companyName') as string;
  const crn = formData.get('crn') as string;
  const trn = formData.get('trn') as string;
  const contactPerson = formData.get('contactPerson') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const address = formData.get('address') as string;

  await db.insert(clients).values({
    tenantId: tenant.id,
    companyName,
    crn,
    trn,
    contactPerson,
    email,
    phone,
    address,
  });

  revalidatePath('/dashboard/clients');
  redirect('/dashboard/clients');
}
