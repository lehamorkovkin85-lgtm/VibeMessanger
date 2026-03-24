import { NextResponse } from 'next/server';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// TEMPORARY: Call GET /api/debug/reset-users to wipe all users from Firestore
// Delete this file after use!
export async function GET() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const ids = snap.docs.map(d => d.id);
    await Promise.all(ids.map(id => deleteDoc(doc(db, 'users', id))));
    return NextResponse.json({ success: true, deleted: ids.length, ids });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
