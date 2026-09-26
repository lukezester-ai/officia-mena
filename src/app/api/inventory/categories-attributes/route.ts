import { NextRequest, NextResponse } from 'next/server';
import { requireTenant, requireRole } from '@/lib/auth';
import {
  createCategory,
  getCategories,
  getCategoryTree,
  updateCategory,
  deleteCategory,
  createAttribute,
  getAttributes,
  updateAttribute,
  deleteAttribute,
  setProductAttributeValue,
  getProductAttributes,
  deleteProductAttributeValue,
  searchProductsByAttributes,
} from '@/lib/inventory';

export async function GET(request: NextRequest) {
  try {
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'categories') {
      const categories = await getCategories(tenant.id);
      return NextResponse.json({ success: true, data: categories });
    }

    if (action === 'category-tree') {
      const tree = await getCategoryTree(tenant.id);
      return NextResponse.json({ success: true, data: tree });
    }

    if (action === 'attributes') {
      const attributes = await getAttributes(tenant.id);
      return NextResponse.json({ success: true, data: attributes });
    }

    if (action === 'product-attributes') {
      const productId = searchParams.get('productId');
      if (!productId) {
        return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
      }

      const attributes = await getProductAttributes(productId);
      return NextResponse.json({ success: true, data: attributes });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole('admin', 'inventory');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'create-category') {
      const { name, description, parentId, code, level } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const category = await createCategory({
        tenantId: tenant.id,
        name,
        description,
        parentId,
        code,
        level,
        userId,
      });

      return NextResponse.json({ success: true, data: category });
    }

    if (action === 'create-attribute') {
      const { name, type, options, isRequired, isSearchable } = body;
      const userId = (await requireTenant()).id; // Would need actual user ID

      const attribute = await createAttribute({
        tenantId: tenant.id,
        name,
        type,
        options,
        isRequired,
        isSearchable,
        userId,
      });

      return NextResponse.json({ success: true, data: attribute });
    }

    if (action === 'set-attribute-value') {
      const { productId, attributeId, value } = body;

      const attributeValue = await setProductAttributeValue(productId, attributeId, value);
      return NextResponse.json({ success: true, data: attributeValue });
    }

    if (action === 'search-by-attributes') {
      const { searchCriteria } = body;

      const products = await searchProductsByAttributes(tenant.id, searchCriteria);
      return NextResponse.json({ success: true, data: products });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole('admin', 'inventory');
    const tenant = await requireTenant();
    const body = await request.json();
    const { action } = body;

    if (action === 'update-category') {
      const { categoryId, updates } = body;

      const category = await updateCategory(categoryId, tenant.id, updates);
      return NextResponse.json({ success: true, data: category });
    }

    if (action === 'update-attribute') {
      const { attributeId, updates } = body;

      const attribute = await updateAttribute(attributeId, tenant.id, updates);
      return NextResponse.json({ success: true, data: attribute });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireRole('admin', 'inventory');
    const tenant = await requireTenant();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'delete-category') {
      const categoryId = searchParams.get('categoryId');
      if (!categoryId) {
        return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
      }

      await deleteCategory(categoryId, tenant.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete-attribute') {
      const attributeId = searchParams.get('attributeId');
      if (!attributeId) {
        return NextResponse.json({ success: false, error: 'Attribute ID is required' }, { status: 400 });
      }

      await deleteAttribute(attributeId, tenant.id);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete-attribute-value') {
      const productId = searchParams.get('productId');
      const attributeId = searchParams.get('attributeId');

      if (!productId || !attributeId) {
        return NextResponse.json({ success: false, error: 'Product ID and Attribute ID are required' }, { status: 400 });
      }

      await deleteProductAttributeValue(productId, attributeId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
