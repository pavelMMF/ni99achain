// scripts/console-vote-test.mjs
// Run: node scripts/console-vote-test.mjs
// Requires: hardhat node running on http://127.0.0.1:8545

const {
  createPublicClient,
  createWalletClient,
  http,
  encodeFunctionData,
  parseUnits,
  formatUnits,
  keccak256,
  toHex,
} = await import("viem");

const RPC = "http://127.0.0.1:8545";
const chain = {
  id: 31337,
  name: "Hardhat",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
};

// ⚠️ Адреса после деплоя (обновляй при деплое)
const ADDR = {
  GovToken:      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  MeritOracle:   "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  MeritGovernor: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  Counter:       "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
};

const publicClient = createPublicClient({ chain, transport: http(RPC) });

const accounts = await publicClient.request({ method: "eth_accounts", params: [] });
if (!accounts || accounts.length < 2) throw new Error("eth_accounts < 2 (не hardhat node?)");

const admin = createWalletClient({ chain, transport: http(RPC), account: accounts[0] });
const voter = createWalletClient({ chain, transport: http(RPC), account: accounts[1] });

const adminAddr = admin.account.address;
const voterAddr = voter.account.address;

const fmt = (x, dec) => formatUnits(x, dec);
const ctx = (s) => keccak256(toHex(s));

// fast mine
const mine = async (n = 1n) => {
  try {
    await publicClient.request({ method: "hardhat_mine", params: [toHex(n)] });
  } catch {
    for (let i = 0n; i < n; i++) await publicClient.request({ method: "evm_mine", params: [] });
  }
};
const mineTo = async (targetBlock) => {
  const target = BigInt(targetBlock);
  const cur = await publicClient.getBlockNumber();
  if (cur >= target) return;
  await mine(target - cur);
};

const stateName = (n) => ([
  "Pending","Active","Canceled","Defeated","Succeeded","Queued","Expired","Executed"
][Number(n)] ?? `Unknown(${n})`);

// ===== ABI (минимум)
const tokenAbi = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "transfer", stateMutability: "nonpayable", inputs: [{ type: "address" }, { type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "delegate", stateMutability: "nonpayable", inputs: [{ type: "address" }], outputs: [] },
  { type: "function", name: "getVotes", stateMutability: "view", inputs: [{ type: "address" }], outputs: [{ type: "uint256" }] },
];

const oracleAbi = [
  { type: "function", name: "currentDay", stateMutability: "view", inputs: [], outputs: [{ type: "uint48" }] },
  { type: "function", name: "pushDailyTopicWeights", stateMutability: "nonpayable",
    inputs: [{ type: "uint48" }, { type: "uint32" }, { type: "address[]" }, { type: "uint192[]" }, { type: "bytes32" }],
    outputs: []
  },
  { type: "function", name: "weightAtTopic", stateMutability: "view",
    inputs: [{ type: "address" }, { type: "uint256" }, { type: "uint32" }],
    outputs: [{ type: "uint256" }]
  },
];

const governorAbi = [
  { type: "function", name: "votingDelay", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "votingPeriod", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "proposeWithTopic", stateMutability: "nonpayable",
    inputs: [{ type: "uint32" }, { type: "address[]" }, { type: "uint256[]" }, { type: "bytes[]" }, { type: "string" }],
    outputs: [{ type: "uint256" }]
  },
  { type: "function", name: "proposalSnapshot", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "proposalDeadline", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "state", stateMutability: "view", inputs: [{ type: "uint256" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "castVote", stateMutability: "nonpayable", inputs: [{ type: "uint256" }, { type: "uint8" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "proposalVotes", stateMutability: "view",
    inputs: [{ type: "uint256" }],
    outputs: [{ type: "uint256" }, { type: "uint256" }, { type: "uint256" }]
  },
];

const counterAbi = [
  { type: "function", name: "incBy", stateMutability: "nonpayable", inputs: [{ type: "uint256" }], outputs: [] },
];

// ===== sanity: bytecode
for (const [k, a] of Object.entries(ADDR)) {
  const b = await publicClient.getBytecode({ address: a });
  if (!b || b === "0x") throw new Error(`No code at ${k} ${a} (не тот деплой/нода)`);
}

console.log("ADMIN =", adminAddr);
console.log("VOTER =", voterAddr);

// ===== decimals & caps
const decimals = Number(await publicClient.readContract({ address: ADDR.GovToken, abi: tokenAbi, functionName: "decimals" }));
const CAP_TOPIC1 = parseUnits("100000", decimals);
const CAP_TOPIC2 = parseUnits("1000000", decimals);

// ===== ensure voter has 1M
const bal = (a) => publicClient.readContract({ address: ADDR.GovToken, abi: tokenAbi, functionName: "balanceOf", args: [a] });

let balVoter = await bal(voterAddr);
if (balVoter < CAP_TOPIC2) {
  const need = CAP_TOPIC2 - balVoter;
  console.log(`Transfer to voter: +${fmt(need, decimals)} GovToken`);
  const hash = await admin.writeContract({ address: ADDR.GovToken, abi: tokenAbi, functionName: "transfer", args: [voterAddr, need] });
  await publicClient.waitForTransactionReceipt({ hash });
  balVoter = await bal(voterAddr);
}
console.log("VOTER balance =", fmt(balVoter, decimals));

// ===== delegate
{
  const hash = await voter.writeContract({ address: ADDR.GovToken, abi: tokenAbi, functionName: "delegate", args: [voterAddr] });
  await publicClient.waitForTransactionReceipt({ hash });
  await mine(1n);
}
const votesNow = await publicClient.readContract({ address: ADDR.GovToken, abi: tokenAbi, functionName: "getVotes", args: [voterAddr] });
console.log("votesNow =", fmt(votesNow, decimals));

// ===== oracle caps
const day = await publicClient.readContract({ address: ADDR.MeritOracle, abi: oracleAbi, functionName: "currentDay" });
const pushCap = async (topicId, weight, label) => {
  const hash = await admin.writeContract({
    address: ADDR.MeritOracle, abi: oracleAbi, functionName: "pushDailyTopicWeights",
    args: [day, topicId, [voterAddr], [weight], ctx(label)],
  });
  await publicClient.waitForTransactionReceipt({ hash });
};

await pushCap(0, CAP_TOPIC2, "ctx-topic0");
await pushCap(1, CAP_TOPIC1, "ctx-topic1");
await pushCap(2, CAP_TOPIC2, "ctx-topic2");

const nowTs = (await publicClient.getBlock()).timestamp;
const cap1Now = await publicClient.readContract({ address: ADDR.MeritOracle, abi: oracleAbi, functionName: "weightAtTopic", args: [voterAddr, nowTs, 1] });
const cap2Now = await publicClient.readContract({ address: ADDR.MeritOracle, abi: oracleAbi, functionName: "weightAtTopic", args: [voterAddr, nowTs, 2] });

console.log("oracle cap topic1 =", fmt(cap1Now, decimals));
console.log("oracle cap topic2 =", fmt(cap2Now, decimals));

// ===== propose
const calldata = encodeFunctionData({ abi: counterAbi, functionName: "incBy", args: [1n] });
const targets = [ADDR.Counter];
const values = [0n];
const calldatas = [calldata];

const salt = (await publicClient.getBlockNumber()).toString();

const propose = async (topicId, desc) => {
  const sim = await publicClient.simulateContract({
    address: ADDR.MeritGovernor,
    abi: governorAbi,
    functionName: "proposeWithTopic",
    args: [topicId, targets, values, calldatas, desc],
    account: voterAddr,
  });
  const hash = await voter.writeContract(sim.request);
  await publicClient.waitForTransactionReceipt({ hash });
  return sim.result;
};

const proposalId1 = await propose(1, `TEST Topic1 cap=100k #${salt}`);
const proposalId2 = await propose(2, `TEST Topic2 cap=1M #${salt}`);

const snap1 = await publicClient.readContract({ address: ADDR.MeritGovernor, abi: governorAbi, functionName: "proposalSnapshot", args: [proposalId1] });
const snap2 = await publicClient.readContract({ address: ADDR.MeritGovernor, abi: governorAbi, functionName: "proposalSnapshot", args: [proposalId2] });
const ddl1  = await publicClient.readContract({ address: ADDR.MeritGovernor, abi: governorAbi, functionName: "proposalDeadline", args: [proposalId1] });
const ddl2  = await publicClient.readContract({ address: ADDR.MeritGovernor, abi: governorAbi, functionName: "proposalDeadline", args: [proposalId2] });

console.log("proposal1 =", proposalId1.toString(), "snapshot =", snap1.toString(), "deadline =", ddl1.toString());
console.log("proposal2 =", proposalId2.toString(), "snapshot =", snap2.toString(), "deadline =", ddl2.toString());

// go to max(snapshot)+1
const target = (snap1 > snap2 ? snap1 : snap2) + 1n;
await mineTo(target);

const st1 = await publicClient.readContract({ address: ADDR.MeritGovernor, abi: governorAbi, functionName: "state", args: [proposalId1] });
const st2 = await publicClient.readContract({ address: ADDR.MeritGovernor, abi: governorAbi, functionName: "state", args: [proposalId2] });

console.log("state1 =", Number(st1), stateName(st1));
console.log("state2 =", Number(st2), stateName(st2));
if (Number(st1) !== 1 || Number(st2) !== 1) throw new Error("Proposals должны быть Active");

// cast
const cast = async (proposalId) => {
  const sim = await publicClient.simulateContract({
    address: ADDR.MeritGovernor,
    abi: governorAbi,
    functionName: "castVote",
    args: [proposalId, 1],
    account: voterAddr,
  });
  const hash = await voter.writeContract(sim.request);
  await publicClient.waitForTransactionReceipt({ hash });
  return sim.result;
};

const used1 = await cast(proposalId1);
const used2 = await cast(proposalId2);

const pv1 = await publicClient.readContract({ address: ADDR.MeritGovernor, abi: governorAbi, functionName: "proposalVotes", args: [proposalId1] });
const pv2 = await publicClient.readContract({ address: ADDR.MeritGovernor, abi: governorAbi, functionName: "proposalVotes", args: [proposalId2] });

const for1 = pv1[1];
const for2 = pv2[1];

console.log("\n=== RESULTS ===");
console.log("Topic1 used =", fmt(used1, decimals), "FOR =", fmt(for1, decimals), "(expected 100000)");
console.log("Topic2 used =", fmt(used2, decimals), "FOR =", fmt(for2, decimals), "(expected 1000000)");

if (for1 !== CAP_TOPIC1) throw new Error(`Topic1 mismatch: got ${fmt(for1, decimals)}`);
if (for2 !== CAP_TOPIC2) throw new Error(`Topic2 mismatch: got ${fmt(for2, decimals)}`);

console.log("\n✅ OK: Topic1 capped to 100k, Topic2 capped to 1M");
