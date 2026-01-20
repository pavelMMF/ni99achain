import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatIgnition from "@nomicfoundation/hardhat-ignition";
import "dotenv/config";

function normalizePk(pk?: string) {
  const s = (pk ?? "").trim();
  if (!s) return "";
  return s.startsWith("0x") ? s : `0x${s}`;
}

const sepoliaUrl = (process.env.SEPOLIA_RPC_URL ?? "").trim();
const sepoliaPk = normalizePk(process.env.SEPOLIA_PRIVATE_KEY);

const homeUrl = (process.env.HOME_RPC_URL ?? "http://127.0.0.1:8545").trim();
const homePk = normalizePk(process.env.HOME_PRIVATE_KEY); // ОБЯЗАТЕЛЬНО 0x...

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin, hardhatViem, hardhatIgnition],

  solidity: {
    profiles: {
      default: { version: "0.8.28" },
      production: {
        version: "0.8.28",
        settings: { optimizer: { enabled: true, runs: 200 } },
      },
    },
  },

  networks: {
    homedao: {
      type: "http",
      chainType: "l1",
      url: homeUrl,
      chainId: 1337,
      accounts: homePk ? [homePk] : [],
    },

    ...(sepoliaUrl && sepoliaPk
      ? {
          sepolia: {
            type: "http",
            chainType: "l1",
            url: sepoliaUrl,
            accounts: [sepoliaPk],
          },
        }
      : {}),
  },
});
