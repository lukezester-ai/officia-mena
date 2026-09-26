import { db } from '@/lib/db/db';
import {
  productCategories,
  productAttributes,
  productAttributeValues,
} from '@/lib/db/schema/inventory_extensions';
import { eq, and, desc } from 'drizzle-orm';

export interface CategoryInput {
  tenantId: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  code?: string;
  level?: number;
  userId: string;
}

export async function createCategory(input: CategoryInput) {
  const [category] = await db
    .insert(productCategories)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      description: input.description,
      parentId: input.parentId,
      code: input.code,
      level: input.level || 0,
      isActive: true,
    })
    .returning();

  return category;
}

export async function getCategories(tenantId: string) {
  return db
    .select()
    .from(productCategories)
    .where(and(eq(productCategories.tenantId, tenantId), eq(productCategories.isActive, true)))
    .orderBy(productCategories.level, productCategories.name);
}

export async function getCategoryTree(tenantId: string) {
  const categories = await getCategories(tenantId);

  const categoryMap = new Map(categories.map(cat => [cat.id, { ...cat, children: [] }]));
  const rootCategories: any[] = [];

  for (const category of categories) {
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId);
      if (parent) {
        parent.children.push(categoryMap.get(category.id));
      }
    } else {
      rootCategories.push(categoryMap.get(category.id));
    }
  }

  return rootCategories;
}

export async function updateCategory(
  categoryId: string,
  tenantId: string,
  updates: Partial<{
    name: string;
    description: string | null;
    code: string;
    isActive: boolean;
  }>
) {
  const [category] = await db
    .update(productCategories)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(productCategories.id, categoryId), eq(productCategories.tenantId, tenantId)))
    .returning();

  return category;
}

export async function deleteCategory(categoryId: string, tenantId: string) {
  await db
    .update(productCategories)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(productCategories.id, categoryId), eq(productCategories.tenantId, tenantId)));
}

export interface AttributeInput {
  tenantId: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
  options?: any;
  isRequired?: boolean;
  isSearchable?: boolean;
  userId: string;
}

export async function createAttribute(input: AttributeInput) {
  const [attribute] = await db
    .insert(productAttributes)
    .values({
      tenantId: input.tenantId,
      name: input.name,
      type: input.type,
      options: input.options as any,
      isRequired: input.isRequired || false,
      isSearchable: input.isSearchable || false,
      isActive: true,
    })
    .returning();

  return attribute;
}

export async function getAttributes(tenantId: string) {
  return db
    .select()
    .from(productAttributes)
    .where(and(eq(productAttributes.tenantId, tenantId), eq(productAttributes.isActive, true)))
    .orderBy(productAttributes.name);
}

export async function updateAttribute(
  attributeId: string,
  tenantId: string,
  updates: Partial<{
    name: string;
    type: 'text' | 'number' | 'boolean' | 'select' | 'multiselect';
    options: any;
    isRequired: boolean;
    isSearchable: boolean;
    isActive: boolean;
  }>
) {
  const [attribute] = await db
    .update(productAttributes)
    .set({
      ...updates,
      options: updates.options as any,
      updatedAt: new Date(),
    })
    .where(and(eq(productAttributes.id, attributeId), eq(productAttributes.tenantId, tenantId)))
    .returning();

  return attribute;
}

export async function deleteAttribute(attributeId: string, tenantId: string) {
  await db
    .update(productAttributes)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(productAttributes.id, attributeId), eq(productAttributes.tenantId, tenantId)));
}

export async function setProductAttributeValue(
  productId: string,
  attributeId: string,
  value: string
) {
  const [attributeValue] = await db
    .insert(productAttributeValues)
    .values({
      productId,
      attributeId,
      value,
    })
    .onConflictDoUpdate({
      target: [productAttributeValues.productId, productAttributeValues.attributeId],
      set: { value, updatedAt: new Date() },
    })
    .returning();

  return attributeValue;
}

export async function getProductAttributes(productId: string) {
  return db
    .select({
      attributeId: productAttributes.id,
      attributeName: productAttributes.name,
      attributeType: productAttributes.type,
      value: productAttributeValues.value,
    })
    .from(productAttributeValues)
    .innerJoin(productAttributes, eq(productAttributes.id, productAttributeValues.attributeId))
    .where(eq(productAttributeValues.productId, productId));
}

export async function deleteProductAttributeValue(productId: string, attributeId: string) {
  await db
    .delete(productAttributeValues)
    .where(and(
      eq(productAttributeValues.productId, productId),
      eq(productAttributeValues.attributeId, attributeId)
    ));
}

export async function searchProductsByAttributes(tenantId: string, searchCriteria: Array<{ attributeId: string; value: string }>) {
  // This would require joining with products table
  // For now, return empty array
  return [];
}
