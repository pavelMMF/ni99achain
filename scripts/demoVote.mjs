import "dotenv/config";
import {
  JsonRpcProvider,
  Wallet,
  Contract,
  Interface,
  id,
  parseUnits,
} from "ethers";

const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";

// адреса из деплоя (проверь свои)
const GOV_ADDR =
  process.env.GOV_ADDR ?? "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
const GOVTOKEN_ADDR =
  process.env.GOVTOKEN_ADDR ?? "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// приватники (для anvil можешь взять из лога anvil: (0), (1), (2)...)
const DEPLOYER_PK = process.env.DEPLOYER_PRIVATE_KEY; // обязателен
const VOTER1_PK = process.env.VOTER1_PRIVATE_KEY; // опционально
const VOTER2_PK = process.env.VOTER2_PRIVATE_KEY; // опционально

if (!DEPLOYER_PK) {
  console.error("Set DEPLOYER_PRIVATE_KEY in .env");
  process.exit(1);
}

const tokenAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function delegate(address)",
];

const govAbi = [
  "function votingDelay() view returns (uint256)",
  "function votingPeriod() view returns (uint256)",
  "function propose(address[] targets,uint256[] values,bytes[] calldatas,string description) returns (uint256)",
  "function castVoteWithReason(uint256 proposalId,uint8 support,string reason) returns (uint256)",
  "event ProposalCreated(uint256 proposalId,address proposer,address[] targets,uint256[] values,string[] signatures,bytes[] calldatas,uint256 voteStart,uint256 voteEnd,string description)",
];

const govIface = new Interface(govAbi);
const proposalCreatedTopic = id(
  "ProposalCreated(uint256,address,address[],uint256[],string[],bytes[],uint256,uint256,string)"
);

async function mine(provider, n) {
  for (let i = 0; i < n; i++) await provider.send("evm_mine", []);
}

async function main() {
  const provider = new JsonRpcProvider(RPC_URL);

  const deployer = new Wallet(DEPLOYER_PK, provider);
  const voters = [VOTER1_PK, VOTER2_PK]
    .filter(Boolean)
    .map((pk) => new Wallet(pk, provider));

  const token = new Contract(GOVTOKEN_ADDR, tokenAbi, deployer);
  const gov = new Contract(GOV_ADDR, govAbi, deployer);

  console.log("RPC:", RPC_URL);
  console.log("Governor:", GOV_ADDR);
  console.log("GovToken:", GOVTOKEN_ADDR);
  console.log("Deployer:", deployer.address);
  if (voters.length) console.log("Voters:", voters.map((v) => v.address));

  const [sym, dec] = await Promise.all([token.symbol(), token.decimals()]);
  console.log(`Token: ${sym}, decimals=${dec}`);

  // 1) Раздаём токены голосующим (если заданы) + делегируем
  // Важно: делегация должна быть ДО предложения/снапшота
  for (const v of voters) {
    const amount = parseUnits("10", dec); // 10 токенов
    console.log(`Transfer ${sym} -> ${v.address}: 10`);
    await (await token.transfer(v.address, amount)).wait();
  }

  console.log("Delegate deployer to self");
  await (await token.delegate(deployer.address)).wait();

  for (const v of voters) {
    console.log(`Delegate voter to self: ${v.address}`);
    await (await token.connect(v).delegate(v.address)).wait();
  }

  // фиксируем чекпоинты голосов
  await mine(provider, 1);

  // 2) Создаём proposal (no-op): GovToken.transfer(deployer, 0)
  // (перевод 0 почти всегда проходит даже при 0 балансе у Governor)
  const calldata = token.interface.encodeFunctionData("transfer", [
    deployer.address,
    0n,
  ]);

  const description = `Demo proposal: GovToken.transfer(${deployer.address}, 0)`;
  console.log("Create proposal:", description);

  const tx = await gov.propose([GOVTOKEN_ADDR], [0], [calldata], description);
  const rcpt = await tx.wait();

  let proposalId = null;
  for (const l of rcpt.logs) {
    if (
      l.address.toLowerCase() === GOV_ADDR.toLowerCase() &&
      l.topics?.[0] === proposalCreatedTopic
    ) {
      const parsed = govIface.parseLog(l);
      proposalId = parsed.args.proposalId.toString();
      break;
    }
  }
  if (!proposalId) {
    console.error("Can't find ProposalCreated in receipt logs");
    process.exit(1);
  }

  console.log("proposalId:", proposalId);
  console.log("proposal tx:", rcpt.hash);

  // 3) Двигаем блоки до старта голосования
  const delay = Number(await gov.votingDelay());
  const period = Number(await gov.votingPeriod());
  console.log("votingDelay:", delay, "blocks");
  console.log("votingPeriod:", period, "blocks");

  if (delay > 0) {
    console.log(`Mining ${delay} blocks to reach voting start...`);
    await mine(provider, delay);
  }

  // 4) Голосуем
  console.log("Cast votes...");
  // 1=For, 0=Against, 2=Abstain
  await (
    await gov
      .connect(deployer)
      .castVoteWithReason(proposalId, 1, "deployer says FOR")
  ).wait();

  if (voters[0]) {
    await (
      await gov
        .connect(voters[0])
        .castVoteWithReason(proposalId, 0, "voter1 says AGAINST")
    ).wait();
  }

  if (voters[1]) {
    await (
      await gov
        .connect(voters[1])
        .castVoteWithReason(proposalId, 1, "voter2 says FOR")
    ).wait();
  }

  console.log("Done. Now run: node scripts/checkVotes.mjs");
  console.log("And open Blockscout:");
  console.log(`  http://127.0.0.1:8080/address/${GOV_ADDR}`);
  console.log(`  http://127.0.0.1:8080/txs`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});