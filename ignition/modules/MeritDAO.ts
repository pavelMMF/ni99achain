import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MeritDAO", (m) => {
  const admin = m.getAccount(0);

  const token = m.contract("GovToken");

  // В твоей ветке MeritOracle требует admin в конструктор
  const oracle = m.contract("MeritOracle", [admin]);

  const votingDelay = 1n;
  const votingPeriod = 20n;

  const governor = m.contract("MeritGovernor", [
    token,
    oracle,
    admin,
    votingDelay,
    votingPeriod,
  ]);

  return { token, oracle, governor };
});
