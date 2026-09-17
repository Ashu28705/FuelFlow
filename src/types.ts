/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'admin' | 'owner' | 'manager' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  profileImage?: string;
  assignedStationId?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface FuelStation {
  id: string;
  name: string;
  ownerId: string;
  location: string;
  address: string;
  contact: string;
  fuelTypes: string[];
  workerIds: string[];
  status: 'Active' | 'Inactive';
  petrolPrice: number;
  dieselPrice: number;
  createdAt: string;
}

export interface WorkerDetail {
  userId: string;
  stationId: string;
  joiningDate: string;
  salary: number;
  attendance: { [date: string]: 'Present' | 'Absent' | 'Leave' };
}

export interface Payment {
  id: string;
  transactionId?: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Credit';
  stationId: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  createdAt: string;
}

export interface SalesReport {
  id: string;
  stationId: string;
  workerId: string;
  petrolSalesLitres: number;
  petrolSalesValue: number;
  dieselSalesLitres: number;
  dieselSalesValue: number;
  paymentBreakdown?: {
    cash: number;
    upi: number;
    card: number;
    credit: number;
  };
  expenses: number;
  cashCollection: number;
  onlinePayments: number;
  grossIncome: number; // petrolSalesValue + dieselSalesValue - expenses
  notes?: string;
  billImage?: string; // base64 or upload data url
  billFileName?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  stationId: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  userId?: string; // Empty means public/all
  status: 'unread' | 'read';
  type?: 'report_submitted' | 'worker_added' | 'expense_alert' | 'revenue_drop';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  userId: string;
  userName: string;
  userRole: Role;
  details: string;
  createdAt: string;
}
