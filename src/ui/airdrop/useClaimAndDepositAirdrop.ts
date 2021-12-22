import { UseMutationResult } from "react-query";

import { Airdrop } from "elf-council-typechain";
import { ContractReceipt, Signer } from "ethers";
import { airdropContract } from "src/elf/contracts";
import { useSmartContractTransaction } from "@elementfi/react-query-typechain";

export function useClaimAndDepositAirdrop(
  signer: Signer | undefined
): UseMutationResult<
  ContractReceipt | undefined,
  unknown,
  Parameters<Airdrop["claimAndDelegate"]>
> {
  const claimAndDeposit = useSmartContractTransaction(
    airdropContract,
    "claimAndDelegate",
    signer
  );
  return claimAndDeposit;
}