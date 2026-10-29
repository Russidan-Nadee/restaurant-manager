const money = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB" });

export function formatAmount(amount: string): string {
  const [whole, fraction = ""] = amount.split(".");
  return money.formatToParts(BigInt(whole))
    .map(part => part.type === "fraction" ? fraction.padEnd(2, "0") : part.value).join("");
}
