import algosdk from "algosdk";
import { SignerTransaction } from "@perawallet/connect/dist/util/model/peraWalletModels";

async function generateOptIntoAssetTxns({
  assetID,
  sender,
}: {
  assetID: number;
  sender: string;
  algod: any;
}): Promise<SignerTransaction[]> {
  const algod = new algosdk.Algodv2(
    "",
    "https://node.testnet.algoexplorerapi.io/",
    443
  );

  let amount = 100000; // equals .1 ALGO
  const suggestedParams = await algod.getTransactionParams().do();
  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: sender,
    to: sender,
    assetIndex: assetID,
    amount: amount,
    suggestedParams,
  });

  return [{ txn: optInTxn, signers: [sender] }];
}

async function generatePaymentTxns({
  sender,
  algod,
}: {
  sender: string;
  algod: any;
}) {
  let amount = 100000; // equals .1 ALGO
  const suggestedParams = await algod.getTransactionParams().do();

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender,
    to: sender,
    amount: amount,
    suggestedParams,
  });

  return [{ txn, signers: [sender] }];
}

async function generateAssetTransferTxns({
  assetID,
  sender,
  algod,
}: {
  to: string;
  assetID: number;
  sender: string;
  algod: any;
}) {
  const suggestedParams = await algod.getTransactionParams().do();

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: sender,
    to: sender,
    assetIndex: assetID,
    amount: 1,
    suggestedParams,
  });

  return [{ txn, signers: [sender] }];
}

async function optInTransaction(
  accountAddress: string,
  peraWalletInstance: any,
  algod: any
) {
  const txGroups = await generateOptIntoAssetTxns({
    assetID: 10458941,
    sender: accountAddress,
    algod,
  });

  try {
    await peraWalletInstance.signTransaction([txGroups]);
    console.log("Transaction Signed.");
  } catch (error) {
    console.log("Couldn't sign Opt-in txns", error);
    alert("Couldnt sign Opt-in txns.");
  }
}

export {
  generateOptIntoAssetTxns,
  generateAssetTransferTxns,
  generatePaymentTxns,
  optInTransaction,
};
