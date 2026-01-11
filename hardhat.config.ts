import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatIgnition from "@nomicfoundation/hardhat-ignition";
import "dotenv/config";

const sepoliaUrl = process.env.SEPOLIA_RPC_URL;
const sepoliaPk = process.env.SEPOLIA_PRIVATE_KEY;

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin, hardhatViem, hardhatIgnition],

  solidity: {
    profiles: {
      default: { version: "0.8.28" },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    },
  },

  networks: {
    hardhatMainnet: { type: "edr-simulated", chainType: "l1", chainId: 77777 },
    hardhatOp: { type: "edr-simulated", chainType: "op", chainId: 77777 },
    homedao: {
      type: "http",
      chainType: "l1",
      url: "http://127.0.0.1:8545",
      chainId: 77777,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
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