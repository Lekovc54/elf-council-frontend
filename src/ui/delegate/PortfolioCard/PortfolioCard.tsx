import { ChangeEvent, ReactElement, useCallback } from "react";

import { Signer } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import Link from "next/link";
import { Delegate } from "src/elf-council-delegates/delegates";
import tw, {
  display,
  flexDirection,
  fontSize,
  fontWeight,
  gap,
  justifyContent,
  lineHeight,
  margin,
  textColor,
  width,
} from "src/elf-tailwindcss-classnames";
import { elementTokenContract } from "src/elf/contracts";
import { useTokenBalanceOf } from "src/elf/token/useTokenBalanceOf";
import Button from "src/ui/base/Button/Button";
import { ButtonVariant } from "src/ui/base/Button/styles";
import { useNumericInputValue } from "src/ui/base/Input/useNumericInputValue";
import { useDeposits } from "src/ui/contracts/useDeposits";
import { BalanceLabeledStat } from "src/ui/delegate/BalanceLabeledStat/BalanceLabeledStat";
import { DepositInput } from "src/ui/overview/DepositCard/DepositInput";
import { useDepositIntoLockingVault } from "src/ui/rewards/useDepositIntoLockingVault";
import { useWithdrawFromLockingVault } from "src/ui/rewards/useWithdrawFromLockingVault";
import { jt, t } from "ttag";

interface PortfolioCardProps {
  account: string | null | undefined;
  signer: Signer | undefined;
  currentDelegate: Delegate | undefined;
}

const portfolioTooltip = t`Don’t know what the difference between your wallet balance and eligible voting balance is? Click this icon to learn more`;

function PortfolioCard(props: PortfolioCardProps): ReactElement {
  const { account, signer, currentDelegate } = props;

  const { value: deposit, setNumericValue: setDeposit } =
    useNumericInputValue();
  const { value: withdraw, setNumericValue: setWithdraw } =
    useNumericInputValue();

  const clearDepositInput = () => setDeposit("");
  const clearWithdrawInput = () => setWithdraw("");

  const { data: walletBalanceBN } = useTokenBalanceOf(
    elementTokenContract,
    account,
  );
  const walletBalance = formatEther(walletBalanceBN || 0);

  const { data: [, vaultBalanceBN] = [] } = useDeposits(account);
  const vaultBalance = formatEther(vaultBalanceBN || 0);

  const { mutate: onDeposit } = useDepositIntoLockingVault(
    signer,
    clearDepositInput,
  );

  const { mutate: onWithdraw } = useWithdrawFromLockingVault(
    signer,
    clearWithdrawInput,
  );

  const onSetDepositAmount = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newDepositAmount = event.target.value;
      setDeposit(newDepositAmount);
    },
    [setDeposit],
  );

  const onSetWithdrawalAmount = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newWithdrawalAmount = event.target.value;
      setWithdraw(newWithdrawalAmount);
    },
    [setWithdraw],
  );

  const depositClickHandler = () => {
    if (!account || !signer || !currentDelegate) return;
    onDeposit([account, parseEther(deposit), currentDelegate.address]);
  };

  const withdrawClickHandler = () => {
    if (!account) return;
    onWithdraw([parseEther(withdraw)]);
  };

  const setMaxDeposit = () => {
    if (!account) return;
    setDeposit(walletBalance);
  };
  const setMaxWithdraw = () => {
    if (!account) return;
    setWithdraw(vaultBalance);
  };

  return (
    <div>
      {/* Balance Stats */}
      <div
        className={tw(
          display("flex"),
          flexDirection("flex-col"),
          margin("mb-4"),
        )}
      >
        <BalanceLabeledStat
          tooltip={portfolioTooltip}
          tooltipHref="/resources"
          label={t`Wallet Balance`}
          balance={walletBalance}
          className={margin("mb-2")}
        />
        <BalanceLabeledStat
          tooltip={portfolioTooltip}
          tooltipHref="/resources"
          label={t`Deposited Balance`}
          balance={vaultBalance}
        />
      </div>

      {/* Deposit Section */}
      <div>
        <PortfolioDepositText />
        <div className={margin("mt-3")}>
          <div
            className={tw(
              textColor("text-white"),
              fontSize("text-sm"),
              margin("mb-2"),
            )}
          >{jt`Tokens Eligible to Deposit: ${walletBalance}`}</div>
          <DepositInput
            depositAmount={deposit}
            balance={walletBalance}
            onSetDepositAmount={onSetDepositAmount}
            id={"deposit-amount"}
            name={t`Deposit amount`}
            placeholder={t`Insert amount to deposit`}
            screenReaderLabel={t`Amount to deposit`}
          />
        </div>
        <div
          className={tw(
            width("w-full"),
            display("flex"),
            justifyContent("justify-end"),
            margin("mt-4"),
            gap("gap-4"),
          )}
        >
          <Button
            onClick={setMaxDeposit}
            disabled={!parseInt(walletBalance)}
            variant={ButtonVariant.GRADIENT}
          >{t`Max`}</Button>
          <Button
            onClick={depositClickHandler}
            disabled={!parseInt(walletBalance) || !deposit}
            variant={ButtonVariant.GRADIENT}
          >{t`Deposit`}</Button>
        </div>
      </div>

      {/* Withdraw Section */}
      <div className={margin("mt-7")}>
        <PortfolioWithdrawText />
        <div className={margin("mt-3")}>
          <div
            className={tw(
              textColor("text-white"),
              fontSize("text-sm"),
              margin("mb-2"),
            )}
          >{jt`Tokens Eligible to Deposit: ${walletBalance}`}</div>
          <DepositInput
            depositAmount={withdraw}
            balance={vaultBalance}
            onSetDepositAmount={onSetWithdrawalAmount}
            id={"withdraw-amount"}
            name={t`Withdraw amount`}
            placeholder={t`Insert amount to withdraw`}
            screenReaderLabel={t`Amount to withdraw`}
          />
        </div>
        <div
          className={tw(
            width("w-full"),
            display("flex"),
            justifyContent("justify-end"),
            margin("mt-4"),
            gap("gap-4"),
          )}
        >
          <Button
            onClick={setMaxWithdraw}
            disabled={!parseInt(vaultBalance)}
            variant={ButtonVariant.WHITE}
          >{t`Max`}</Button>
          <Button
            onClick={withdrawClickHandler}
            disabled={!parseInt(vaultBalance) || !withdraw}
            variant={ButtonVariant.WHITE}
          >{t`Withdraw`}</Button>
        </div>
      </div>
    </div>
  );
}

function PortfolioDepositText(): ReactElement {
  return (
    <p
      className={tw(
        textColor("text-white"),
        fontWeight("font-light"),
        lineHeight("leading-5"),
        fontSize("text-sm"),
      )}
    >
      To protect our governance system, we ask our users to{" "}
      <span className={fontWeight("font-bold")}>deposit</span> their tokens when
      they have the intention to vote and/or delegate.{" "}
      <span className={fontWeight("font-bold")}>
        This verifies your eligibility to vote and/or delegate.
      </span>{" "}
      <div>
        <Link href="/resources" passHref>
          <span className={tw(textColor("text-goldYellow"))}>
            To learn more about our vaults read here.
          </span>
        </Link>
      </div>
    </p>
  );
}

function PortfolioWithdrawText(): ReactElement {
  return (
    <p
      className={tw(
        textColor("text-white"),
        fontWeight("font-light"),
        lineHeight("leading-5"),
        fontSize("text-sm"),
      )}
    >
      To remove deposited tokens from voting eligibility enter a withdrawal
      amount.
      <div>
        <Link href="/resources" passHref>
          <span className={tw(textColor("text-goldYellow"))}>
            Read more to learn about our voting vaults.
          </span>
        </Link>
      </div>
    </p>
  );
}

export default PortfolioCard;