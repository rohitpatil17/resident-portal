// src/app/core/models/resident.model.ts

export interface Resident {
  id: string;
  name: string;
  unit: string;
  community: string;
  email: string;
  phone: string;
}

export interface BalanceSummary {
  totalDue: number;
  currentDue: number;
  lotRent: number;
  pastBalance: number;
  lateFees: number;
  dueDate: string;
  autoPay: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  method?: string;
}

export interface BillingStatement {
  id: string;
  period: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending';
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  type: 'info' | 'warning' | 'alert';
}

export interface AccountSection {
  id: string;
  title: string;
  description: string;
  disabled?: boolean;
}
