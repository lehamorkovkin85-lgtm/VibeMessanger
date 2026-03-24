import fs from 'fs/promises';
import path from 'path';

// Types
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

export type Message = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
};

export type DbSchema = {
  users: User[];
  friendships: Friendship[];
  messages: Message[];
  channels: Channel[];
};

const DB_PATH = path.join(process.cwd(), '.mockdb.json');

const INITIAL_DB: DbSchema = {
  users: [],
  friendships: [],
  messages: [],
  channels: []
};

// Initialize DB safely
export async function getDb(): Promise<DbSchema> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data) as DbSchema;
    if (!parsed.channels) parsed.channels = [];
    return parsed;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await saveDb(INITIAL_DB);
      return INITIAL_DB;
    }
    throw error;
  }
}

export async function saveDb(data: DbSchema): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
