import { NextRequest, NextResponse } from 'next/server';
import { tavilySearch } from '@/lib/tavily';
import type { CompareResult } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  let body: { companyName?: unknown } | null = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { companyName } = body;

  if (typeof companyName !== 'string' || !companyName.trim()) {
    return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
  }

  try {
    const data = await tavilySearch(companyName.trim());
    const result: CompareResult = {
      results: data.results ?? [],
      answer: data.answer,
    };
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Tavily error:', error.message);
    }
    return NextResponse.json({ error: 'Comparison failed. Please try again.' }, { status: 500 });
  }
}
