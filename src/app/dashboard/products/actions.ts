'use server'

import { db } from '@/lib/db/db';
import { products } from '@/lib/db/schema/inventory';
import { requireTenant } from '@/lib/auth/get-tenant';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProduct(formData: FormData) {
  const tenant = await requireTenant();
  
  const type = formData.get('type') as string;
  const name = formData.get('name') as string;
  const sku = formData.get('sku') as string;
  const barcode = formData.get('barcode') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const unitPrice = formData.get('unitPrice') as string;
  const costPrice = formData.get('costPrice') as string;
  
  // Halal & MENA fields
  const isHalalCertified = formData.get('isHalalCertified') === 'on';
  const halalCertificateNumber = formData.get('halalCertificateNumber') as string;
  const halalExpiryDateStr = formData.get('halalExpiryDate') as string;
  const expiryDateHijri = formData.get('expiryDateHijri') as string;

  await db.insert(products).values({
    tenantId: tenant.id,
    type,
    name,
    sku,
    barcode,
    description,
    category,
    unitPrice: parseFloat(unitPrice || '0').toFixed(2),
    costPrice: costPrice ? parseFloat(costPrice).toFixed(2) : null,
    isHalalCertified,
    halalCertificateNumber,
    halalExpiryDate: halalExpiryDateStr ? new Date(halalExpiryDateStr) : null,
    expiryDateHijri,
  });

  revalidatePath('/dashboard/products');
  redirect('/dashboard/products');
}
