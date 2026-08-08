import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

function secureEquals(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

export async function requireApiUser() {
  const session = await auth();
  if (!session?.user?.email) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) } as const;
  }
  return { session } as const;
}

export function requireBearerSecret(request: Request, environmentVariable: string) {
  const expected = process.env[environmentVariable];
  if (!expected) {
    return NextResponse.json({ error: `${environmentVariable} is not configured` }, { status: 503 });
  }

  const authorization = request.headers.get('authorization');
  const actual = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!actual || !secureEquals(actual, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
