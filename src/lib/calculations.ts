type Item = {
  price: number;
  assignedTo: string; // Member ID
};

export function calculateSplits(
  items: Item[],
  tax: number,
  discount: number
): Record<string, number> {
  // 1. Hitung Subtotal (Total harga makanan mentah)
  const subtotal = items.reduce((acc, item) => acc + item.price, 0);

  // Guard clause: Kalau subtotal 0, jangan bagi nol (error)
  if (subtotal === 0) return {};

  const splits: Record<string, number> = {};

  // 2. Loop setiap item untuk hitung beban per orang
  items.forEach((item) => {
    // Rumus Proporsional:
    // (Harga Item / Subtotal) --> Porsi dia berapa persen?
    const ratio = item.price / subtotal;

    // Hitung bagian Pajak & Diskon untuk item ini
    const itemTax = tax * ratio;
    const itemDiscount = discount * ratio;

    // Total Akhir Item Ini = Harga + Pajak - Diskon
    const finalAmount = item.price + itemTax - itemDiscount;

    // Masukkan ke akumulasi member
    if (!splits[item.assignedTo]) {
      splits[item.assignedTo] = 0;
    }
    splits[item.assignedTo] += finalAmount;
  });

  // 3. Rounding (Pembulatan biar gak ada koma desimal aneh)
  // Kita bulatkan ke integer terdekat
  Object.keys(splits).forEach((memberId) => {
    splits[memberId] = Math.round(splits[memberId]);
  });

  return splits;
}
