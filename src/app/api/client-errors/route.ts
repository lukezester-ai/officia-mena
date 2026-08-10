import { auth } from '@/auth';

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null) as { message?: unknown; stack?: unknown; digest?: unknown; path?: unknown } | null;
  const event = {
    message: typeof body?.message === 'string' ? body.message.slice(0, 500) : 'Unknown client error',
    stack: typeof body?.stack === 'string' ? body.stack.slice(0, 4000) : null,
    digest: typeof body?.digest === 'string' ? body.digest.slice(0, 200) : null,
    path: typeof body?.path === 'string' ? body.path.slice(0, 500) : null,
  };

  console.error('Client application error', event);
  return Response.json({ received: true });
}
