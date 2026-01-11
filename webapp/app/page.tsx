import { JsonRpcProvider } from "ethers";

export const dynamic = "force-dynamic";

function rpcUrl() {
  return process.env.NEXT_PUBLIC_RPC_URL ?? "http://127.0.0.1:8545";
}

function blockscoutUrl() {
  return process.env.NEXT_PUBLIC_BLOCKSCOUT_URL ?? "http://127.0.0.1:8080";
}

export default async function Home() {
  const provider = new JsonRpcProvider(rpcUrl());

  const [blockNumber, network] = await Promise.all([
    provider.getBlockNumber(),
    provider.getNetwork(),
  ]);

  return (
    <main style={{ padding: 24, fontFamily: "ui-sans-serif, system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>ni99achain LAN Gov UI</h1>

      <div style={{ marginTop: 16 }}>
        <div>RPC: <code>{rpcUrl()}</code></div>
        <div>chainId: <code>{network.chainId.toString()}</code></div>
        <div>latest block: <code>{blockNumber}</code></div>
      </div>

      <div style={{ marginTop: 16 }}>
        Blockscout:{" "}
        <a href={blockscoutUrl()} target="_blank" rel="noreferrer">
          {blockscoutUrl()}
        </a>
      </div>
    </main>
  );
}
