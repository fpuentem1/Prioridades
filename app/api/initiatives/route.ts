import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import StrategicInitiative from '@/models/StrategicInitiative';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    let query: any = {};

    if (activeOnly) {
      query.isActive = true;
    }

    const initiatives = await StrategicInitiative.find(query)
      .sort({ order: 1 })
      .lean();

    return NextResponse.json(initiatives);
  } catch (error: any) {
    console.error('Error fetching initiatives:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins pueden crear iniciativas
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();

    // Determinar el orden automáticamente
    const maxOrder = await StrategicInitiative.findOne().sort({ order: -1 }).select('order');
    const order = maxOrder ? maxOrder.order + 1 : 1;

    const initiative = await StrategicInitiative.create({
      name: body.name,
      description: body.description || '',
      color: body.color || '#3B82F6',
      order,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json(initiative, { status: 201 });
  } catch (error: any) {
    console.error('Error creating initiative:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
