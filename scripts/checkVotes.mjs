import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { ethers } from "ethers";

const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";
const GOVERNOR_ADDRESS =
  (process.env.GOVERNOR_ADDRESS ?? "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0").toLowerCase();

const BLOCKSCOUT_BASE = process.env.BLOCKSCOUT_BASE ?? "http://127.0.0.1:8080";

// сколько блоков назад искать (чтобы не сканить вечность)
const LOOKBACK_BLOCKS = Number(process.env.LOOKBACK_BLOCKS ?? "20000");

function loadGovernorAbi() {
  const candidates = [
    // твоя структура: contracts/merit/MeritGovernor.sol
    path.join(process.cwd(), "artifacts", "contracts", "merit", "MeritGovernor.sol", "MeritGovernor.json"),
    // запасной вариант
    path.join(process.cwd(), "artifacts", "contracts", "MeritGovernor.sol", "MeritGovernor.json"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      const json = JSON.parse(fs.readFileSync(p, "utf8"));
      return json.abi;
    }
  }

  throw new Error(
    "Не нашёл artifact MeritGovernor.json. Проверь, что компиляция прошла и путь правильный:\n" +
      candidates.join("\n")
  );
}

function supportToText(s) {
  const n = Number(s);
  if (n === 0) return "AGAINST";
  if (n === 1) return "FOR";
  if (n === 2) return "ABSTAIN";
  return `UNKNOWN(${n})`;
}

async function main() {
  console.log("RPC:", RPC_URL);
  console.log("Governor:", GOVERNOR_ADDRESS);

  const abi = loadGovernorAbi();
  const iface = new ethers.Interface(abi);
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const gov = new ethers.Contract(GOVERNOR_ADDRESS, abi, provider);

  const latest = await provider.getBlockNumber();
  const fromBlock = Math.max(0, latest - LOOKBACK_BLOCKS);

  // найдём все VoteCast* события в ABI (на всякий случай)
  const voteEventFragments = iface.fragments
    .filter((f) => f.type === "event" && f.name && f.name.startsWith("VoteCast"))
    .map((f) => f);

  const proposalEvent = iface.fragments.find((f) => f.type === "event" && f.name === "ProposalCreated");
  if (!proposalEvent) {
    throw new Error("В ABI нет события ProposalCreated (странно для Governor).");
  }

  // --- ProposalCreated logs
  const proposalLogs = await provider.getLogs({
    address: GOVERNOR_ADDRESS,
    fromBlock,
    toBlock: latest,
    topics: [proposalEvent.topicHash],
  });

  const proposals = new Map(); // proposalId -> { proposer, start, end, description, txHash }

  for (const log of proposalLogs) {
    const parsed = iface.parseLog(log);
    const args = parsed.args;

    const proposalId = (args.proposalId ?? args[0]).toString();
    const proposer = (args.proposer ?? args[1]).toString();

    // в разных версиях OZ поля называются по-разному
    const voteStart = (args.voteStart ?? args.startBlock ?? args[args.length - 3])?.toString?.() ?? "?";
    const voteEnd = (args.voteEnd ?? args.endBlock ?? args[args.length - 2])?.toString?.() ?? "?";
    const description = (args.description ?? args[args.length - 1])?.toString?.() ?? "";

    proposals.set(proposalId, {
      proposer,
      voteStart,
      voteEnd,
      description,
      txHash: log.transactionHash,
    });
  }

  console.log("Found proposals:", proposals.size);
  if (proposals.size === 0) {
    console.log("Нет proposals — сначала запусти demoVote.mjs");
    return;
  }

  console.log("Proposal IDs:", Array.from(proposals.keys()));

  // --- VoteCast logs (соберём по всем вариантам VoteCast*)
  const votesByProposal = new Map(); // proposalId -> votes[]

  for (const ev of voteEventFragments) {
    const logs = await provider.getLogs({
      address: GOVERNOR_ADDRESS,
      fromBlock,
      toBlock: latest,
      topics: [ev.topicHash],
    });

    for (const log of logs) {
      const parsed = iface.parseLog(log);
      const a = parsed.args;

      // типичные поля: voter, proposalId, support, weight, reason
      const voter = (a.voter ?? a[0]).toString();
      const proposalId = (a.proposalId ?? a[1]).toString();
      const support = a.support ?? a[2];
      const weight = a.weight ?? a[3];
      const reason = a.reason ?? a[4] ?? "";

      const entry = {
        event: parsed.name,
        voter,
        support: supportToText(support),
        weight: weight?.toString?.() ?? String(weight),
        reason: reason?.toString?.() ?? "",
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
      };

      if (!votesByProposal.has(proposalId)) votesByProposal.set(proposalId, []);
      votesByProposal.get(proposalId).push(entry);
    }
  }

  // --- Печать
  for (const [proposalId, meta] of proposals.entries()) {
    console.log("\n========================================");
    console.log("Proposal:", proposalId);
    console.log("Proposer:", meta.proposer);
    console.log("voteStart:", meta.voteStart, "voteEnd:", meta.voteEnd);
    console.log("Description:", meta.description);
    console.log("Proposal tx:", meta.txHash);
    console.log("Blockscout tx:", `${BLOCKSCOUT_BASE}/tx/${meta.txHash}`);

    // попробуем дернуть state + votes, если есть
    try {
      if (gov.state) {
        const st = await gov.state(proposalId);
        console.log("State:", st.toString());
      }
    } catch {}

    try {
      // GovernorCountingSimple: proposalVotes(proposalId) -> (against, for, abstain)
      if (gov.proposalVotes) {
        const pv = await gov.proposalVotes(proposalId);
        // pv может быть массивом/объектом
        const against = pv.againstVotes ?? pv[0];
        const forVotes = pv.forVotes ?? pv[1];
        const abstain = pv.abstainVotes ?? pv[2];
        console.log("Votes:", {
          against: against?.toString?.(),
          for: forVotes?.toString?.(),
          abstain: abstain?.toString?.(),
        });
      }
    } catch {}

    const votes = votesByProposal.get(proposalId) ?? [];
    console.log("VoteCast logs:", votes.length);

    for (const v of votes.sort((x, y) => x.blockNumber - y.blockNumber)) {
      console.log(
        ` - ${v.support}  voter=${v.voter}  weight=${v.weight}  tx=${v.txHash} (${BLOCKSCOUT_BASE}/tx/${v.txHash})`
      );
      if (v.reason) console.log(`   reason: ${v.reason}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});