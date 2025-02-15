"use client";

import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: true,
        env: "devnet",
        metadata: {
          name: "UnifiedWallet",
          description: "UnifiedWallet",
          url: "https://jup.ag",
          iconUrls: ["https://jup.ag/favicon.ico"],
        },
        walletlistExplanation: {
          href: "https://station.jup.ag/docs/additional-topics/wallet-list",
        },
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
}
