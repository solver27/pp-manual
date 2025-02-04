const { parseEther } = require("@ethersproject/units");
const { JsonRpcProvider } = require("@ethersproject/providers");
const { Wallet } = require("@ethersproject/wallet");
const { Contract, utils } = require("ethers");
const dotenv = require("dotenv");
const Big = require("big.js");
const abi = require("./abi.json");

const result = dotenv.config();
if (result.error) {
  throw result.error;
}
const Web3 = require("web3");
const w = new Web3(process.env.BSC_RPC);
const wallet = w.eth.accounts.wallet.add(
  w.eth.accounts.privateKeyToAccount(process.env.PRIVATE_KEY)
);

const signer = new Wallet(
  process.env.PRIVATE_KEY,
  new JsonRpcProvider(process.env.BSC_RPC)
);

let contract = new Contract(
  process.env.PCS_ADDRESS.toString(),
  JSON.parse(abi.result),
  signer
);

const predictionContract = contract.connect(signer);

const betAmount = [0, 0.01, 0.02, 0.04, 0.08, 0.16];

//Bet UP
const betUp = async (amount) => {
  try {
    const epoch = await predictionContract.currentEpoch();
    const tx = await predictionContract.betBull(epoch, {
      value: parseEther(amount.toFixed(18).toString()),
    });
    await tx.wait();
    console.log(`Successful of ${amount} to UP`);
  } catch (error) {
    console.log("Transaction Error", error);
  }
};

//Bet DOWN
const betDown = async (amount) => {
  try {
    const epoch = await predictionContract.currentEpoch();
    const tx = await predictionContract.betBear(epoch, {
      value: parseEther(amount.toFixed(18).toString()),
    });
    await tx.wait();
    console.log(`Successful of ${amount} to DOWN`);
  } catch (error) {
    console.log("Transaction Error", error);
  }
};

const claim = async () => {
  try {
    const epoch = await predictionContract.currentEpoch();
    const isClaimable = await predictionContract.claimable(parseInt(epoch) - 2, signer.address);
    if (isClaimable) {
      await predictionContract.claim([parseInt(epoch) - 2]);
      console.log("claimed")
    }
  } catch (err) {
    console.error(err);
  }
};

const args = process.argv.slice(2);
if (args[0] === "u") {
  betUp(betAmount[parseInt(args[1])]);
} else if (args[0] === "d") {
  betDown(betAmount[parseInt(args[1])]);
} else if (args[0] === "c") {
  claim();
}
