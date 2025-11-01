import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Priority from '@/models/Priority';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const weekStart = searchParams.get('weekStart');
    const weekEnd = searchParams.get('weekEnd');

    let query: any = {};

    // Si es usuario normal, solo ver sus prioridades
    if ((session.user as any).role !== 'ADMIN' && !userId) {
      query.userId = (session.user as any).id;
    } else if (userId) {
      query.userId = userId;
    }

    // Filtrar por rango de semana
    if (weekStart && weekEnd) {
      query.weekStart = {
        $gte: new Date(weekStart),
        $lte: new Date(weekEnd)
      };
    }

    const priorities = await Priority.find(query)
      .sort({ weekStart: -1, createdAt: -1 })
      .lean();

    return NextResponse.json(priorities);
  } catch (error: any) {
    console.error('Error fetching priorities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Validar que el usuario solo cree sus propias prioridades (a menos que sea admin)
    if ((session.user as any).role !== 'ADMIN' && body.userId !== (session.user as any).id) {
      return NextResponse.json({ error: 'No puedes crear prioridades para otros usuarios' }, { status: 403 });
    }

    const priority = await Priority.create({
      ...body,
      wasEdited: false,
      isCarriedOver: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json(priority, { status: 201 });
  } catch (error: any) {
    console.error('Error creating priority:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
