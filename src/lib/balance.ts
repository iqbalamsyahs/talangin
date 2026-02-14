type Member = {
    id: string;
    name: string;
};

type Expense = {
    payerMemberId: string;
    amount: number;
};

type Split = {
    memberId: string;
    amountOwed: number;
};

export function calculateBalances(members: Member[], expenses: Expense[], splits: Split[]) {
    const balances: Record<string, number> = {};

    // 1. Inisialisasi saldo 0 untuk semua member
    members.forEach(m => {
        balances[m.id] = 0;
    });

    // 2. Tambah Saldo (Buat yang nalangin/bayarin)
    // Kalau dia bayar Rp 100.000, berarti saldo dia +100.000
    expenses.forEach(exp => {
        if (balances[exp.payerMemberId] !== undefined) {
            balances[exp.payerMemberId] += exp.amount;
        }
    });

    // 3. Kurang Saldo (Buat yang jajan/hutng)
    // Kalau dia makan Rp 20.000, berarti saldo dia -20.000
    splits.forEach(split => {
        if (balances[split.memberId] !== undefined) {
            balances[split.memberId] -= split.amountOwed;
        }
    });

    // Hasil:
    // Positif (+): "Gue harus dapet duit balik"
    // Negatif (-): "Gue harus bayar utang"
    return balances;
}