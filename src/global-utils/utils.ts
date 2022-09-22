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

  const receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
  let amount = 100000; // equals .1 ALGO
  const suggestedParams = await algod.getTransactionParams().do();
  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: sender,
    to: receiver,
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
  const receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
  let amount = 100000; // equals .1 ALGO
  const suggestedParams = await algod.getTransactionParams().do();
  const enc = new TextEncoder();
  const note = enc.encode("First transaction!");

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender,
    to: receiver,
    amount: amount,
    note: note,
    suggestedParams: suggestedParams,
  });

  return [{ txn, signers: [sender] }];
}

async function generateAssetTransferTxns({
  assetID,
  algod,
}: {
  to: string;
  assetID: number;
  sender: string;
  algod: any;
}) {
  let sender = "Y7OJ5UXKXOD7ILYLPWLJAKESIDPXPTNNIC2QMTCNMXBZPDSGDTCEKI55XI";
  const receiver = "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
  const suggestedParams = await algod.getTransactionParams().do();
  let amount = 100000; // equals .1 ALGO
  const enc = new TextEncoder();
  const note = enc.encode("First transaction!");

  const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: sender,
    to: receiver,
    assetIndex: assetID,
    amount: amount,
    note: note,
    suggestedParams: suggestedParams,
  });

  return [{ txn2, signers: [sender] }];
}

async function optInTransaction(
  accountAddress: string,
  peraWalletInstance: any,
  algod: any
) {
  const txGroups = await generateOptIntoAssetTxns({
    assetID: 106961444,
    sender: "5JJQBWWHAGQZYFILBDPS26DGI54TQJWR4O2RCFXX3B3MGZRGDPIYEEDLW4",
    algod,
  });

  try {
    await peraWalletInstance.signTransaction([txGroups]);
    console.log("Transaction Signed successfully.");
  } catch (error) {
    console.log("Failed to get apps from the sdk", error);
  }
}

const keypress = async () => {
  
};
// Create an account and add funds to it. Copy the address off
// The Algorand TestNet Dispenser is located here:
// https://dispenser.testnet.aws.algodev.network/

const createAccount = function () {
  try {
    const myaccount = algosdk.generateAccount();
    console.log("Account Address = " + myaccount.addr);
    let account_mnemonic = algosdk.secretKeyToMnemonic(myaccount.sk);
    console.log("Account Mnemonic = " + account_mnemonic);
    console.log("Account created. Save off Mnemonic and address");
    console.log("Add funds to account using the TestNet Dispenser: ");
    console.log(
      "https://dispenser.testnet.aws.algodev.network?account=" + myaccount.addr
    );

    return myaccount;
  } catch (err) {
    console.log("err", err);
  }
};

async function firstTransaction() {
  try {
    let myAccount = createAccount();
    console.log({ myAccount });
    if (myAccount) {
      console.log("Press any key when the account is funded");
      await keypress();
      // Connect your client
      
      const algodToken =
        "2f3203f21e738a1de6110eba6984f9d03e5a95d7a577b34616854064cf2c0e7b";
      const algodServer = "https://academy-algod.dev.aws.algodev.network/";
      const algodPort = "";
      let algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

      //Check your balance
      let accountInfo = await algodClient
        .accountInformation(myAccount.addr)
        .do();
      console.log("Account balance: %d microAlgos", accountInfo.amount);
      let startingAmount = accountInfo.amount;
      // Construct the transaction
      let params = await algodClient.getTransactionParams().do();
      // comment out the next two lines to use suggested fee
      // params.fee = 1000;
      // params.flatFee = true;

      // receiver defined as TestNet faucet address
      const receiver =
        "HZ57J3K46JIJXILONBBZOHX6BKPXEM2VVXNRFSUED6DKFD5ZD24PMJ3MVA";
      const enc = new TextEncoder();
      const note = enc.encode("First transaction");
      let amount = 100000;
      let closeout = receiver; //closeRemainderTo
      let sender = myAccount.addr;
      let txn = algosdk.makePaymentTxnWithSuggestedParams(
        sender,
        receiver,
        amount,
        closeout,
        note,
        params
      );
      // WARNING! all remaining funds in the sender account above will be sent to the closeRemainderTo Account
      // In order to keep all remaning funds in the sender account after tx, set closeout parameter to undefined.
      // For more info see:
      // https://developer.algorand.org/docs/reference/transactions/#payment-transaction

      // Sign the transaction
      let signedTxn = txn.signTxn(myAccount.sk);
      let txId = txn.txID().toString();
      console.log("Signed transaction with txID: %s", txId);

      // Submit the transaction
      await algodClient.sendRawTransaction(signedTxn).do();

      // Wait for confirmation
      let confirmedTxn = await algosdk.waitForConfirmation(
        algodClient,
        txId,
        4
      );
      //Get the completed Transaction
      console.log(
        "Transaction " +
          txId +
          " confirmed in round " +
          confirmedTxn["confirmed-round"]
      );
      var string = new TextDecoder().decode(confirmedTxn.txn.txn.note);
      console.log("Note field: ", string);
      accountInfo = await algodClient.accountInformation(myAccount.addr).do();
      console.log(
        "Transaction Amount: %d microAlgos",
        confirmedTxn.txn.txn.amt
      );
      console.log("Transaction Fee: %d microAlgos", confirmedTxn.txn.txn.fee);
      let closeoutamt =
        startingAmount - confirmedTxn.txn.txn.amt - confirmedTxn.txn.txn.fee;
      console.log("Close To Amount: %d microAlgos", closeoutamt);
      console.log("Account balance: %d microAlgos", accountInfo.amount);
    }
  } catch (err) {
    console.log("err", err);
  }
  process.exit();
}

export {
  generateOptIntoAssetTxns,
  generateAssetTransferTxns,
  generatePaymentTxns,
  optInTransaction,
  firstTransaction,
};
