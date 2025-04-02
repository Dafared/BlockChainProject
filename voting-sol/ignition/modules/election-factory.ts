import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const ElectionModule = buildModule("ElectionModule", (m) => {
  // 部署基础合约
  const voterRegistration = m.contract("VoterRegistration");
  const candidateRegistration = m.contract("CandidateRegistration");

  // 部署投票合约
  const voting = m.contract("Voting", [
    voterRegistration,
    candidateRegistration,
    "General Election 2025",
  ]);

  // 部署选举结果合约
  const electionResults = m.contract("ElectionResults", [
    voting,
    candidateRegistration,
    voterRegistration,
  ]);

  // 部署验证合约
  const electionVerification = m.contract("ElectionVerification", [
    voting,
    electionResults,
    voterRegistration,
    candidateRegistration,
  ]);

  // 部署工厂合约
  const electionFactory = m.contract("ElectionFactory");

  // 在验证合约部署后，设置验证合约地址
  m.call(voting, "setVerificationContract", [electionVerification], {
    id: "setVerificationContract",
  });

  return {
    electionFactory,
    voterRegistration,
    candidateRegistration,
    voting,
    electionResults,
    electionVerification,
  };
});

export default ElectionModule;
