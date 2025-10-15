/**
 * Truncate an Ethereum address, which is either EOA or Smart Contract address, for display purposes.
 * @param addr - The address to truncate.
 * @param head - The number of characters to keep at the start of the address.
 * @param tail - The number of characters to keep at the end of the address.
 * @returns The truncated address.
 */
export function truncateAddress(addr: string | undefined | null, head = 2, tail = 4): string {
  if (!addr) return "";
  // normalize / safety: ensure it starts with 0x
  const a = addr.toString();
  if (a.length <= head + tail + 2) return a; // already short
  return `${a.slice(0, 2 + head)}...${a.slice(-tail)}`;
}

// Example
//console.log(truncateAddress("0xe688b84b23f322a994A53dbF8E15FA82CDB71127")); // "0xe6...1127"
