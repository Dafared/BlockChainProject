/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export declare namespace ElectionVerification {
  export type VerificationRecordStruct = {
    auditor: AddressLike;
    timestamp: BigNumberish;
    comments: string;
    verificationPassed: boolean;
  };

  export type VerificationRecordStructOutput = [
    auditor: string,
    timestamp: bigint,
    comments: string,
    verificationPassed: boolean
  ] & {
    auditor: string;
    timestamp: bigint;
    comments: string;
    verificationPassed: boolean;
  };
}

export interface ElectionVerificationInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "approveAuditor"
      | "auditors"
      | "candidateContract"
      | "checkVoteByNationalID"
      | "electionCommission"
      | "getAllVerificationRecords"
      | "getVerificationCount"
      | "getVerificationRecord"
      | "resultsContract"
      | "submitVerification"
      | "verificationRecords"
      | "verifyVoteCounts"
      | "voterContract"
      | "votingContract"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic: "AuditorApproved" | "VerificationCompleted"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "approveAuditor",
    values: [AddressLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "auditors",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "candidateContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "checkVoteByNationalID",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "electionCommission",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getAllVerificationRecords",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getVerificationCount",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getVerificationRecord",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "resultsContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "submitVerification",
    values: [string, boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "verificationRecords",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyVoteCounts",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "voterContract",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "votingContract",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "approveAuditor",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "auditors", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "candidateContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkVoteByNationalID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "electionCommission",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getAllVerificationRecords",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getVerificationCount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getVerificationRecord",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "resultsContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "submitVerification",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verificationRecords",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyVoteCounts",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "voterContract",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "votingContract",
    data: BytesLike
  ): Result;
}

export namespace AuditorApprovedEvent {
  export type InputTuple = [auditorAddress: AddressLike, organization: string];
  export type OutputTuple = [auditorAddress: string, organization: string];
  export interface OutputObject {
    auditorAddress: string;
    organization: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace VerificationCompletedEvent {
  export type InputTuple = [auditor: AddressLike, passed: boolean];
  export type OutputTuple = [auditor: string, passed: boolean];
  export interface OutputObject {
    auditor: string;
    passed: boolean;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface ElectionVerification extends BaseContract {
  connect(runner?: ContractRunner | null): ElectionVerification;
  waitForDeployment(): Promise<this>;

  interface: ElectionVerificationInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  approveAuditor: TypedContractMethod<
    [_auditorAddress: AddressLike, _organization: string],
    [void],
    "nonpayable"
  >;

  auditors: TypedContractMethod<
    [arg0: AddressLike],
    [
      [string, string, boolean] & {
        auditorAddress: string;
        organization: string;
        isApproved: boolean;
      }
    ],
    "view"
  >;

  candidateContract: TypedContractMethod<[], [string], "view">;

  checkVoteByNationalID: TypedContractMethod<
    [_nationalID: string],
    [bigint],
    "view"
  >;

  electionCommission: TypedContractMethod<[], [string], "view">;

  getAllVerificationRecords: TypedContractMethod<
    [],
    [ElectionVerification.VerificationRecordStructOutput[]],
    "view"
  >;

  getVerificationCount: TypedContractMethod<[], [bigint], "view">;

  getVerificationRecord: TypedContractMethod<
    [_index: BigNumberish],
    [ElectionVerification.VerificationRecordStructOutput],
    "view"
  >;

  resultsContract: TypedContractMethod<[], [string], "view">;

  submitVerification: TypedContractMethod<
    [_comments: string, _verificationPassed: boolean],
    [void],
    "nonpayable"
  >;

  verificationRecords: TypedContractMethod<
    [arg0: BigNumberish],
    [
      [string, bigint, string, boolean] & {
        auditor: string;
        timestamp: bigint;
        comments: string;
        verificationPassed: boolean;
      }
    ],
    "view"
  >;

  verifyVoteCounts: TypedContractMethod<[], [boolean], "view">;

  voterContract: TypedContractMethod<[], [string], "view">;

  votingContract: TypedContractMethod<[], [string], "view">;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "approveAuditor"
  ): TypedContractMethod<
    [_auditorAddress: AddressLike, _organization: string],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "auditors"
  ): TypedContractMethod<
    [arg0: AddressLike],
    [
      [string, string, boolean] & {
        auditorAddress: string;
        organization: string;
        isApproved: boolean;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "candidateContract"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "checkVoteByNationalID"
  ): TypedContractMethod<[_nationalID: string], [bigint], "view">;
  getFunction(
    nameOrSignature: "electionCommission"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getAllVerificationRecords"
  ): TypedContractMethod<
    [],
    [ElectionVerification.VerificationRecordStructOutput[]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getVerificationCount"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getVerificationRecord"
  ): TypedContractMethod<
    [_index: BigNumberish],
    [ElectionVerification.VerificationRecordStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "resultsContract"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "submitVerification"
  ): TypedContractMethod<
    [_comments: string, _verificationPassed: boolean],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "verificationRecords"
  ): TypedContractMethod<
    [arg0: BigNumberish],
    [
      [string, bigint, string, boolean] & {
        auditor: string;
        timestamp: bigint;
        comments: string;
        verificationPassed: boolean;
      }
    ],
    "view"
  >;
  getFunction(
    nameOrSignature: "verifyVoteCounts"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "voterContract"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "votingContract"
  ): TypedContractMethod<[], [string], "view">;

  getEvent(
    key: "AuditorApproved"
  ): TypedContractEvent<
    AuditorApprovedEvent.InputTuple,
    AuditorApprovedEvent.OutputTuple,
    AuditorApprovedEvent.OutputObject
  >;
  getEvent(
    key: "VerificationCompleted"
  ): TypedContractEvent<
    VerificationCompletedEvent.InputTuple,
    VerificationCompletedEvent.OutputTuple,
    VerificationCompletedEvent.OutputObject
  >;

  filters: {
    "AuditorApproved(address,string)": TypedContractEvent<
      AuditorApprovedEvent.InputTuple,
      AuditorApprovedEvent.OutputTuple,
      AuditorApprovedEvent.OutputObject
    >;
    AuditorApproved: TypedContractEvent<
      AuditorApprovedEvent.InputTuple,
      AuditorApprovedEvent.OutputTuple,
      AuditorApprovedEvent.OutputObject
    >;

    "VerificationCompleted(address,bool)": TypedContractEvent<
      VerificationCompletedEvent.InputTuple,
      VerificationCompletedEvent.OutputTuple,
      VerificationCompletedEvent.OutputObject
    >;
    VerificationCompleted: TypedContractEvent<
      VerificationCompletedEvent.InputTuple,
      VerificationCompletedEvent.OutputTuple,
      VerificationCompletedEvent.OutputObject
    >;
  };
}
