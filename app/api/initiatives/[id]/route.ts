import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import StrategicInitiative from '@/models/StrategicInitiative';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await connectDB();

    const initiative = await StrategicInitiative.findById(params.id);

    if (!initiative) {
      return NextResponse.json({ error: 'Iniciativa no encontrada' }, { status: 404 });
    }

    return NextResponse.json(initiative);
  } catch (error: any) {
    console.error('Error fetching initiative:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins pueden editar iniciativas
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const initiative = await StrategicInitiative.findById(params.id);

    if (!initiative) {
      return NextResponse.json({ error: 'Iniciativa no encontrada' }, { status: 404 });
    }

    const body = await request.json();

    const updatedInitiative = await StrategicInitiative.findByIdAndUpdate(
      params.id,
      {
        ...body,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedInitiative);
  } catch (error: any) {
    console.error('Error updating initiative:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Solo admins pueden eliminar iniciativas
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    await connectDB();

    const initiative = await StrategicInitiative.findById(params.id);

    if (!initiative) {
      return NextResponse.json({ error: 'Iniciativa no encontrada' }, { status: 404 });
    }

    await StrategicInitiative.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Iniciativa eliminada exitosamente' });
  } catch (error: any) {
    console.error('Error deleting initiative:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
