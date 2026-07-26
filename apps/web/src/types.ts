export type ModuleTab = 'dashboard' | 'finance' | 'tasks' | 'assets' | 'daily' | 'settings';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider?: 'google' | 'facebook';
}

export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'team';
  ownerId?: string;
  timezone?: string;
  baseCurrency?: string;
  reminderHourLocal?: number;
}

export interface Transaction {
  id: string;
  workspaceId?: string;
  type: 'expense' | 'income';
  amountMinor: number;
  currency?: string;
  occurredOn: string;
  note?: string;
  categoryId?: string;
  walletId?: string;
  receiptUrl?: string;
  status?: string;
}

export interface Wallet {
  id: string;
  workspaceId?: string;
  name: string;
  type: 'cash' | 'bank' | 'e_wallet';
  openingBalanceMinor: number;
  balanceMinor?: number;
  currency?: string;
}

export interface Task {
  id: string;
  workspaceId?: string;
  title: string;
  description?: string;
  priority: 'normal' | 'high';
  status: 'open' | 'done';
  dueOn?: string;
  rrule?: string;
}

export interface Asset {
  id: string;
  workspaceId?: string;
  name: string;
  category: string;
  location?: string;
  status?: string;
  warrantyUntil?: string;
}

export interface Note {
  id: string;
  workspaceId?: string;
  title: string;
  content: string;
  category?: string;
}

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
}
