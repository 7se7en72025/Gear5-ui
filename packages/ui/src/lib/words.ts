/**
 * Numbers to words, Indian style — lakh and crore rather than million and
 * billion. Cheques, invoices and loan agreements all require the amount in
 * words, and every Indian product ends up writing this function badly.
 *
 * `123456` → "One Lakh Twenty Three Thousand Four Hundred Fifty Six"
 */

const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

/** 0–99. */
function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const tens = TENS[Math.floor(n / 10)];
  const ones = ONES[n % 10];
  return ones ? `${tens} ${ones}` : tens;
}

/** 0–999. */
function threeDigits(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds) parts.push(`${ONES[hundreds]} Hundred`);
  if (rest) parts.push(twoDigits(rest));
  return parts.join(" ");
}

/**
 * Integer to Indian words. Groups are crore / lakh / thousand / hundreds —
 * note the 2-2-3 split, not the Western 3-3-3.
 */
export function numberToIndianWords(value: number): string {
  if (!Number.isFinite(value)) return "";
  const n = Math.floor(Math.abs(value));
  if (n === 0) return "Zero";

  const parts: string[] = [];

  // Anything at or above 100 crore is expressed as a multiple of crore too,
  // so recurse on the crore count rather than inventing a bigger unit.
  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1000);
  const rest = n % 1000;

  if (crore) {
    parts.push(
      `${crore > 999 ? numberToIndianWords(crore) : threeDigits(crore)} Crore`,
    );
  }
  if (lakh) parts.push(`${twoDigits(lakh)} Lakh`);
  if (thousand) parts.push(`${twoDigits(thousand)} Thousand`);
  if (rest) parts.push(threeDigits(rest));

  return (value < 0 ? `Minus ${parts.join(" ")}` : parts.join(" ")).trim();
}

/**
 * Full rupees-and-paise phrasing for a cheque or invoice.
 * `1234.50` → "Rupees One Thousand Two Hundred Thirty Four and Fifty Paise Only"
 */
export function amountToWords(
  value: number,
  options: { prefix?: string; suffix?: string } = {},
): string {
  const { prefix = "Rupees", suffix = "Only" } = options;
  const negative = value < 0;
  const abs = Math.abs(value);

  const rupees = Math.floor(abs);
  // Round rather than truncate, so 0.999 doesn't silently become 99 paise.
  const paise = Math.round((abs - rupees) * 100);

  const parts = [prefix, negative ? "Minus" : "", numberToIndianWords(rupees)];
  if (paise > 0) parts.push("and", numberToIndianWords(paise), "Paise");
  parts.push(suffix);

  return parts.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
