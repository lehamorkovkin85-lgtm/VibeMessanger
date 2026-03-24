/**
 * Firestore helper layer — replaces the old file-based mockDb.
 * All mutations go through these functions so the rest of the API
 * routes stay as clean as possible.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ────────────────────────────────────────────────────────────────
export type User = {
  id: string;
  nickname: string;
  email: string;
  passwordHash: string;
  isBanned: boolean;
  isVerified: boolean;
  role: 'admin' | 'user';
  createdAt: string;
  themePalette?: 'vibe' | 'ocean' | 'sunset' | 'forest';
  uiStyle?: 'glass' | 'neomorph' | 'skeuomorph' | 'minimal';
  statusText?: string;
};

export type Channel = {
  id: string;
  name: string;
  creatorId: string;
  isVerified: boolean;
  createdAt: string;
};

export type FriendStatus = 'pending' | 'accepted' | 'rejected';

export type Friendship = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FriendStatus;
  createdAt: string;
};

export type PollData = {
  question: string;
  options: { id: string; text: string; votes: string[] }[];
};

export type Message = {
  id: string;
  senderId: string;
  receiverId: string; // userId for DMs, channelId for channel messages
  text: string;
  createdAt: string;
  type?: 'text' | 'poll';
  pollData?: PollData;
};

// ─── Utility ──────────────────────────────────────────────────────────────
function toIso(value: Timestamp | string | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Timestamp) return value.toDate().toISOString();
  return value as string;
}

function docToUser(id: string, d: DocumentData): User {
  return {
    id,
    nickname: d.nickname,
    email: d.email,
    passwordHash: d.passwordHash,
    isBanned: d.isBanned ?? false,
    isVerified: d.isVerified ?? false,
    role: d.role ?? 'user',
    createdAt: toIso(d.createdAt),
    themePalette: d.themePalette,
    uiStyle: d.uiStyle,
    statusText: d.statusText,
  };
}

function docToFriendship(id: string, d: DocumentData): Friendship {
  return {
    id,
    requesterId: d.requesterId,
    receiverId: d.receiverId,
    status: d.status,
    createdAt: toIso(d.createdAt),
  };
}

function docToMessage(id: string, d: DocumentData): Message {
  return {
    id,
    senderId: d.senderId,
    receiverId: d.receiverId,
    text: d.text,
    createdAt: toIso(d.createdAt),
    type: d.type || 'text',
    pollData: d.pollData,
  };
}

function docToChannel(id: string, d: DocumentData): Channel {
  return {
    id,
    name: d.name,
    creatorId: d.creatorId,
    isVerified: d.isVerified ?? false,
    createdAt: toIso(d.createdAt),
  };
}

// ─── Users ────────────────────────────────────────────────────────────────
export async function getUserById(id: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', id));
  if (!snap.exists()) return null;
  return docToUser(snap.id, snap.data());
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToUser(d.id, d.data());
}

export async function getUserByNickname(nickname: string): Promise<User | null> {
  const q = query(collection(db, 'users'), where('nicknameLower', '==', nickname.toLowerCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToUser(d.id, d.data());
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => docToUser(d.id, d.data()));
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const id = crypto.randomUUID();
  await setDoc(doc(db, 'users', id), {
    ...user,
    nicknameLower: user.nickname.toLowerCase(),
    createdAt: serverTimestamp(),
  });
  return { ...user, id, createdAt: new Date().toISOString() };
}

export async function updateUser(id: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, 'users', id), data as DocumentData);
}

// ─── Friendships ──────────────────────────────────────────────────────────
export async function getFriendshipsForUser(userId: string): Promise<Friendship[]> {
  const [reqSnap, recSnap] = await Promise.all([
    getDocs(query(collection(db, 'friendships'), where('requesterId', '==', userId))),
    getDocs(query(collection(db, 'friendships'), where('receiverId', '==', userId))),
  ]);
  const all = [...reqSnap.docs, ...recSnap.docs];
  return all.map(d => docToFriendship(d.id, d.data()));
}

export async function getFriendshipById(id: string): Promise<Friendship | null> {
  const snap = await getDoc(doc(db, 'friendships', id));
  if (!snap.exists()) return null;
  return docToFriendship(snap.id, snap.data());
}

export async function createFriendship(requesterId: string, receiverId: string): Promise<Friendship> {
  const id = crypto.randomUUID();
  const data = {
    requesterId,
    receiverId,
    status: 'pending' as FriendStatus,
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'friendships', id), data);
  return { id, requesterId, receiverId, status: 'pending', createdAt: new Date().toISOString() };
}

export async function updateFriendship(id: string, status: FriendStatus): Promise<void> {
  await updateDoc(doc(db, 'friendships', id), { status });
}

export async function deleteFriendship(id: string): Promise<void> {
  await deleteDoc(doc(db, 'friendships', id));
}

// ─── Messages ─────────────────────────────────────────────────────────────
export async function getMessagesBetweenUsers(userId1: string, userId2: string): Promise<Message[]> {
  // Firestore doesn't allow OR queries easily; we fetch both directions
  const [snap1, snap2] = await Promise.all([
    getDocs(query(
      collection(db, 'messages'),
      where('senderId', '==', userId1),
      where('receiverId', '==', userId2),
    )),
    getDocs(query(
      collection(db, 'messages'),
      where('senderId', '==', userId2),
      where('receiverId', '==', userId1),
    )),
  ]);
  const msgs = [...snap1.docs, ...snap2.docs].map(d => docToMessage(d.id, d.data()));
  return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function getChannelMessages(channelId: string): Promise<Message[]> {
  const snap = await getDocs(query(
    collection(db, 'messages'),
    where('receiverId', '==', channelId),
  ));
  const msgs = snap.docs.map(d => docToMessage(d.id, d.data()));
  return msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export async function createMessage(senderId: string, receiverId: string, text: string, type: 'text' | 'poll' = 'text', pollData?: PollData): Promise<Message> {
  const id = crypto.randomUUID();
  const data = {
    senderId,
    receiverId,
    text,
    type,
    pollData,
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(db, 'messages', id), data);
  return { 
    id, 
    senderId, 
    receiverId, 
    text, 
    type, 
    pollData: pollData || undefined, 
    createdAt: new Date().toISOString() 
  };
}

export async function voteInPoll(messageId: string, userId: string, optionId: string): Promise<void> {
  const snap = await getDoc(doc(db, 'messages', messageId));
  if (!snap.exists()) return;
  const d = snap.data();
  if (d.type !== 'poll' || !d.pollData) return;

  const pollData = d.pollData as PollData;
  const updatedOptions = pollData.options.map(opt => {
    // Remove user from all other options
    let votes = opt.votes.filter(id => id !== userId);
    // Add user to the target option
    if (opt.id === optionId) {
      votes.push(userId);
    }
    return { ...opt, votes };
  });

  await updateDoc(doc(db, 'messages', messageId), {
    'pollData.options': updatedOptions
  });
}

// ─── Channels ─────────────────────────────────────────────────────────────
export async function getAllChannels(): Promise<Channel[]> {
  const snap = await getDocs(query(collection(db, 'channels'), orderBy('createdAt', 'asc')));
  return snap.docs.map(d => docToChannel(d.id, d.data()));
}

export async function getChannelById(id: string): Promise<Channel | null> {
  const snap = await getDoc(doc(db, 'channels', id));
  if (!snap.exists()) return null;
  return docToChannel(snap.id, snap.data());
}

export async function createChannel(name: string, creatorId: string): Promise<Channel> {
  const id = crypto.randomUUID();
  await setDoc(doc(db, 'channels', id), {
    name,
    creatorId,
    isVerified: false,
    createdAt: serverTimestamp(),
  });
  return { id, name, creatorId, isVerified: false, createdAt: new Date().toISOString() };
}

export async function updateChannel(id: string, data: Partial<Channel>): Promise<void> {
  await updateDoc(doc(db, 'channels', id), data as DocumentData);
}

export async function deleteChannel(id: string): Promise<void> {
  const batch = writeBatch(db);
  batch.delete(doc(db, 'channels', id));
  // Also delete associated messages
  const msgs = await getDocs(query(collection(db, 'messages'), where('receiverId', '==', id)));
  msgs.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}
