export interface Member {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface ExpenseItem {
  id: number;
  name: string;
  price: number | string;
  assignedTo: string;
}

export interface SimpleExpenseInitialData {
  expenseId: string;
  description: string;
  amount: number;
  payerId: string;
  selectedMemberIds: string[];
  date?: Date;
}

export interface ItemizedExpenseInitialData {
  expenseId: string;
  description: string;
  payerId: string;
  tax: number;
  discount: number;
  items: ExpenseItem[];
  date?: Date;
}

export interface SettlementInitialData {
  expenseId: string;
  amount: number;
  fromId: string;
  toId: string;
  date: Date;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}
