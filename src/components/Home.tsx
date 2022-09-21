import { Stack, Heading, Text, Img, Button } from "@chakra-ui/react";
import wallet from "../../src/images/undraw_bitcoin_re_urgq.svg";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect, useState } from "react";

const peraWallet = new PeraWalletConnect();

export default function Home() {
  const [accountAddress, setAccountAddress] = useState<any | null>(null);
  const isConnectedToPeraWallet = !!accountAddress;

  useEffect(() => {
    // Reconnect to the session when the component is mounted
    peraWallet
      .reconnectSession()
      .then((accounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

        if (accounts.length) {
          setAccountAddress(accounts[0]);
        }
      })
      .catch((e) => console.log(e));
  }, []);

  return (
    <Stack direction={{ base: "column", md: "row" }} spacing={10}>
      <Stack p={5} spacing={5}>
        <Heading>Let's get you connected to Pera Wallet!</Heading>
        <Text>
          Wanna get connected to Pera Wallet? Do not worry we got you!
        </Text>
        <Stack direction={{ base: "column", md: "row" }} spacing={6}>
          <Button bgColor="teal.300">Transactions</Button>
          <Button
            bgColor="none"
            onClick={
              isConnectedToPeraWallet
                ? handleDisconnectWalletClick
                : handleConnectWalletClick
            }
          >
            {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
          </Button>
        </Stack>
      </Stack>
      <Stack p={5}>
        <Img src={wallet} alt="wallet" />
      </Stack>
    </Stack>
  );

  function handleConnectWalletClick() {
    peraWallet
      .connect()
      .then((newAccounts) => {
        peraWallet.connector?.on("disconnect", handleDisconnectWalletClick);

        setAccountAddress(newAccounts[0]);
      })
      .catch((error) => {
        if (error?.data?.type !== "CONNECT_MODAL_CLOSED") {
          console.log(error);
        }
      });
  }

  function handleDisconnectWalletClick() {
    peraWallet.disconnect();

    setAccountAddress(null);
  }
}
