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

const betAmount = [
  0,
  0.006,
  0.013,
  0.025,
  0.05,
  0.01
]

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
    GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
      GLOBAL_CONFIG.WAITING_TIME
    );
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
    GLOBAL_CONFIG.WAITING_TIME = reduceWaitingTimeByTwoBlocks(
      GLOBAL_CONFIG.WAITING_TIME
    );
  }
};

const args = process.argv.slice(2);
if (args[0] === 'u') {
  betUp(betAmount[parseInt(args[1])])
}
else {
  betDown(betAmount[parseInt(args[1])])
}

