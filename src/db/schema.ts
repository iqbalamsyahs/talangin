import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// --- ENUMS ---
// Kategori transaksi:
// 'EXPENSE': Pengeluaran biasa (Makan, Transport) -> Menambah Utang
// 'SETTLEMENT': Pelunasan -> Mengurangi Utang
export const categoryEnum = pgEnum("category", ["EXPENSE", "SETTLEMENT"]);

// --- 1. USERS (Sinkron dari Clerk) ---
export const users = pgTable("users", {
  id: text("id").primaryKey(), // ID dari Clerk (user_2b...)
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 2. GROUPS ---
export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  inviteCode: text("invite_code").unique(), // Kode unik untuk share link join
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id), // ADMIN GRUP
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 3. GROUP MEMBERS (Support Ghost Member) ---
export const groupMembers = pgTable("group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  // Jika Member Asli (Login): Isi userId
  // Jika Ghost Member (Manual): userId NULL
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),

  // Nama Wajib diisi (Entah dari Clerk atau Input Manual Admin)
  name: text("name").notNull(),

  joinedAt: timestamp("joined_at").defaultNow(),
});

// --- 4. EXPENSES (Header Transaksi) ---
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),

  description: text("description").notNull(), // "Makan Siang"
  amount: integer("amount").notNull(), // Total Akhir (Net) yang harus dibayar

  category: categoryEnum("category").default("EXPENSE"),

  // Siapa yang nalangin (Bisa User Asli atau Ghost Member)
  payerMemberId: uuid("payer_member_id")
    .notNull()
    .references(() => groupMembers.id),

  // Siapa yang menginput data (Audit Trail - Biasanya Admin)
  createdBy: text("created_by")
    .notNull()
    .references(() => users.id),

  // -- Field Khusus Itemized Split (Boleh Null kalau Simple Split) --
  subtotal: integer("subtotal").default(0), // Harga sebelum pajak/diskon
  tax: integer("tax").default(0), // Pajak + Service + Ongkir
  discount: integer("discount").default(0), // Total Potongan

  date: timestamp("date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 5. EXPENSE ITEMS (Rincian Struk - Buat Edit/Recalculate) ---
// Tabel ini menyimpan baris-baris makanan jika pakai mode Itemized
export const expenseItems = pgTable("expense_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),

  name: text("name").notNull(), // "Nasi Goreng"
  price: integer("price").notNull(), // 40000

  // Siapa yang makan item ini
  assignedToMemberId: uuid("assigned_to_member_id")
    .notNull()
    .references(() => groupMembers.id),
});

// --- 6. EXPENSE SPLITS (Hasil Perhitungan Utang) ---
// Ini adalah "Cache" hasil hitungan. Dashboard baca dari sini biar cepat.
export const expenseSplits = pgTable("expense_splits", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),

  memberId: uuid("member_id")
    .notNull()
    .references(() => groupMembers.id), // Siapa yang berhutang
  amountOwed: integer("amount_owed").notNull(), // Berapa rupiah hutangnya

  isPaid: boolean("is_paid").default(false), // Penanda status (opsional)
});

// --- 7. CONTACTS (Daftar Teman) ---
export const contacts = pgTable("contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: text("owner_id").notNull(), // ID User Kamu (Clerk)
  name: text("name").notNull(), // Nama Teman (misal: "Udin")
  createdAt: timestamp("created_at").defaultNow(),
});

// --- 8. INVITATIONS (Tiket Undangan) ---
export const invitations = pgTable("invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  token: text("token").notNull().unique(), // Kode unik tiket
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  memberId: uuid("member_id")
    .notNull()
    .references(() => groupMembers.id, { onDelete: "cascade" }), // Tiket ini buat siapa?
  usedAt: timestamp("used_at"), // Kapan tiket dipakai?
  createdAt: timestamp("created_at").defaultNow(),
});

// --- RELATIONS (Untuk Drizzle Query API) ---

export const groupsRelations = relations(groups, ({ one, many }) => ({
  admin: one(users, { fields: [groups.createdBy], references: [users.id] }),
  members: many(groupMembers),
  expenses: many(expenses),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, { fields: [groupMembers.userId], references: [users.id] }),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  group: one(groups, { fields: [expenses.groupId], references: [groups.id] }),
  payer: one(groupMembers, {
    fields: [expenses.payerMemberId],
    references: [groupMembers.id],
  }),
  creator: one(users, {
    fields: [expenses.createdBy],
    references: [users.id],
  }),
  items: many(expenseItems), // Relasi ke rincian item
  splits: many(expenseSplits), // Relasi ke hasil split
}));

export const expenseItemsRelations = relations(expenseItems, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseItems.expenseId],
    references: [expenses.id],
  }),
  assignedMember: one(groupMembers, {
    fields: [expenseItems.assignedToMemberId],
    references: [groupMembers.id],
  }),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  member: one(groupMembers, {
    fields: [expenseSplits.memberId],
    references: [groupMembers.id],
  }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  group: one(groups, {
    fields: [invitations.groupId],
    references: [groups.id],
  }),
  member: one(groupMembers, {
    fields: [invitations.memberId],
    references: [groupMembers.id],
  }),
}));
