// Common Constants & Enums
export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';
export type WorkspaceType = 'personal' | 'team';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type TaskPriority = 'low' | 'normal' | 'high';
export type TaskStatus = 'open' | 'done' | 'cancelled';
export type OccurrenceStatus = 'open' | 'done' | 'skipped' | 'moved';
export type AssetStatus = 'available' | 'in_use' | 'repair' | 'retired';
export type MaintenanceType = 'thanh_toan' | 'thay_nhot' | 'thay_pin' | 'sua_chua' | 'kiem_dinh' | 'het_han';

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  timezone: string | null;
}

export interface WorkspaceDTO {
  id: string;
  name: string;
  type: WorkspaceType;
  ownerId: string;
  timezone: string;
  baseCurrency: string;
}

export interface TransactionDTO {
  id: string;
  workspaceId: string;
  type: TransactionType;
  amountMinor: number;
  currency: string;
  categoryId: string | null;
  occurredOn: string;
  note: string | null;
  attachmentUrl: string | null;
  status: 'cleared' | 'pending';
}

export interface TaskDTO {
  id: string;
  workspaceId: string;
  title: string;
  description: string | null;
  isAllDay: boolean;
  dueOn: string | null;
  dueTime: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string | null;
  rrule: string | null;
}

export interface AssetDTO {
  id: string;
  workspaceId: string;
  name: string;
  category: string | null;
  serial: string | null;
  location: string | null;
  status: AssetStatus;
  valueMinor: number | null;
  warrantyUntil: string | null;
}

export interface DashboardSummary {
  todayExpensesMinor: number;
  monthlyExpensesMinor: number;
  monthlyBudgetLimitMinor: number;
  tasksDueTodayCount: number;
  overdueTasksCount: number;
  upcomingRemindersCount: number;
}
