type BalanceMap = Record<string, number>;

interface Settlement {
  from: string; // ID Pengutang
  to: string; // ID Pemberi Utang
  amount: number;
}

export function getSuggestedSettlements(balances: BalanceMap): Settlement[] {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  // 1. Pisahkan siapa yang minus (Debtor) dan siapa yang plus (Creditor)
  Object.entries(balances).forEach(([id, amount]) => {
    if (amount < -1)
      debtors.push({ id, amount }); // Pakai -1 biar gak pusing sama koma desimal
    else if (amount > 1) creditors.push({ id, amount });
  });

  // 2. Sortir dari nominal terbesar (Greedy Algorithm)
  // Biar transaksi efisien, selesaikan utang gede dulu
  debtors.sort((a, b) => a.amount - b.amount); // Ascending (karena negatif, -100 < -50)
  creditors.sort((a, b) => b.amount - a.amount); // Descending

  const settlements: Settlement[] = [];
  let i = 0; // Index Debtor
  let j = 0; // Index Creditor

  // 3. Loop Matchmaking
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];

    // Cari nilai yang bisa dibayar (Minimal dari Hutang vs Piutang)
    // Math.abs karena debtor.amount itu negatif
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);

    // Catat Transaksi
    settlements.push({
      from: debtor.id,
      to: creditor.id,
      amount: amount,
    });

    // Update Sisa Saldo Sementara
    debtor.amount += amount; // Utang berkurang (mendekati 0)
    creditor.amount -= amount; // Piutang berkurang

    // Kalau utang dia lunas (atau sisa dikit bgt), lanjut ke debtor berikutnya
    if (Math.abs(debtor.amount) < 1) i++;

    // Kalau piutang dia lunas, lanjut ke creditor berikutnya
    if (creditor.amount < 1) j++;
  }

  return settlements;
}
