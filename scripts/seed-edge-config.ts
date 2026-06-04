import seedJson from "../src/data/programs.seed.json";

/** One-off: push the seed programs config into Vercel Edge Config. */
async function main(): Promise<void> {
  const id = process.env.EDGE_CONFIG_ID;
  const token = process.env.EDGE_CONFIG_WRITE_TOKEN;
  if (!id || !token) {
    console.error("Set EDGE_CONFIG_ID and EDGE_CONFIG_WRITE_TOKEN before running.");
    process.exit(1);
  }
  const res = await fetch(`https://api.vercel.com/v1/edge-config/${id}/items`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ items: [{ operation: "upsert", key: "programs", value: seedJson }] }),
  });
  console.log(`Edge Config seed: HTTP ${res.status}`);
  console.log(await res.text());
  if (!res.ok) process.exit(1);
}

void main();
