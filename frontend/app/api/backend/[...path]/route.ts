import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path);
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[]
) {
  const url = new URL(request.url);
  const backendPath = pathSegments.join('/');
  const searchParams = url.searchParams.toString();
  const target = `${BACKEND_URL}/${backendPath}${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers(request.headers);
  headers.delete('host');

  // Forward auth token
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  const body = request.body;

  try {
    const res = await fetch(target, {
      method: request.method,
      headers,
      body,
      // @ts-expect-error duplex is needed for streaming
      duplex: 'half',
    });

    const responseHeaders = new Headers(res.headers);
    responseHeaders.delete('transfer-encoding');

    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      { detail: 'خطا در ارتباط با سرور' },
      { status: 502 }
    );
  }
}
