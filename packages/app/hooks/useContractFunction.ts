import {
  BeneficiaryGovernance,
  BeneficiaryRegistry,
  ERC20,
  GrantElections,
  RewardsManager,
  Staking,
  UniswapV2Router02,
} from '@popcorn/contracts/typechain';
import {
  TransactionStatus,
  useContractFunction as DappsUseContractFunction,
} from '@usedapp/core';
import { Contract } from 'ethers';

export type GenericContract =
  | Staking
  | UniswapV2Router02
  | RewardsManager
  | GrantElections
  | ERC20
  | BeneficiaryRegistry
  | BeneficiaryGovernance;
interface UseContractFunctionReturnType<
  ContractType extends Contract,
  Key extends keyof ContractType['functions'],
  Args extends Parameters<ContractType['functions'][Key]>,
> {
  send: (...args: Args) => Promise<void>;
  state: TransactionStatus;
}

function useContractFunction<
  ContractType extends Contract,
  Key extends keyof ContractType['functions'],
  Args extends Parameters<ContractType['functions'][Key]>,
>(
  contract: GenericContract,
  functionName: Key,
): UseContractFunctionReturnType<ContractType, Key, Args> {
  const { send, state } = DappsUseContractFunction(
    contract as any,
    functionName as string,
  );
  const useSend = (...args: Args) => {
    return send(...args);
  };
  return { send: useSend, state } as UseContractFunctionReturnType<
    ContractType,
    Key,
    Args
  >;
}

export { useContractFunction };