// test/election-system.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import {
  VoterRegistration,
  CandidateRegistration,
  Voting,
  ElectionResults,
  ElectionVerification,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Election System", function () {
  // 定义一个fixtures用于部署合约并初始化测试环境
  async function deployElectionSystemFixture() {
    // 获取签名者账户
    const [admin, voter1, voter2, voter3, candidate1, candidate2, auditor] =
      await ethers.getSigners();

    // 部署合约
    const VoterRegistration = await ethers.getContractFactory(
      "VoterRegistration"
    );
    const voterRegistration = await VoterRegistration.deploy();

    const CandidateRegistration = await ethers.getContractFactory(
      "CandidateRegistration"
    );
    const candidateRegistration = await CandidateRegistration.deploy();

    const Voting = await ethers.getContractFactory("Voting");
    const voting = await Voting.deploy(
      await voterRegistration.getAddress(),
      await candidateRegistration.getAddress(),
      "General Election 2025"
    );

    const ElectionResults = await ethers.getContractFactory("ElectionResults");
    const electionResults = await ElectionResults.deploy(
      await voting.getAddress(),
      await candidateRegistration.getAddress(),
      await voterRegistration.getAddress()
    );

    const ElectionVerification = await ethers.getContractFactory(
      "ElectionVerification"
    );
    const electionVerification = await ElectionVerification.deploy(
      await voting.getAddress(),
      await electionResults.getAddress(),
      await voterRegistration.getAddress(),
      await candidateRegistration.getAddress()
    );

    // 设置验证合约地址
    await voting.setVerificationContract(electionVerification.target);

    return {
      voterRegistration,
      candidateRegistration,
      voting,
      electionResults,
      electionVerification,
      admin,
      voter1,
      voter2,
      voter3,
      candidate1,
      candidate2,
      auditor,
    };
  }

  describe("1. Contract Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      const {
        voterRegistration,
        candidateRegistration,
        voting,
        electionResults,
        electionVerification,
      } = await loadFixture(deployElectionSystemFixture);

      // 检查合约是否成功部署
      expect(await voterRegistration.getAddress()).to.be.properAddress;
      expect(await candidateRegistration.getAddress()).to.be.properAddress;
      expect(await voting.getAddress()).to.be.properAddress;
      expect(await electionResults.getAddress()).to.be.properAddress;
      expect(await electionVerification.getAddress()).to.be.properAddress;

      // 确认Election的名称
      expect(await voting.electionName()).to.equal("General Election 2025");
    });

    it("Should set correct contract addresses and owners", async function () {
      const {
        voterRegistration,
        candidateRegistration,
        voting,
        electionResults,
        electionVerification,
        admin,
      } = await loadFixture(deployElectionSystemFixture);

      // 验证合约之间的关联
      expect(await voting.voterContract()).to.equal(
        await voterRegistration.getAddress()
      );
      expect(await voting.candidateContract()).to.equal(
        await candidateRegistration.getAddress()
      );

      // 验证合约所有者是否正确
      expect(await voterRegistration.electionCommission()).to.equal(
        admin.address
      );
      expect(await candidateRegistration.electionCommission()).to.equal(
        admin.address
      );
      expect(await voting.electionCommission()).to.equal(admin.address);
      expect(await electionResults.electionCommission()).to.equal(
        admin.address
      );
      expect(await electionVerification.electionCommission()).to.equal(
        admin.address
      );
    });
  });

  describe("2. Candidate Registration", function () {
    it("Should register candidates correctly", async function () {
      const { candidateRegistration, admin } = await loadFixture(
        deployElectionSystemFixture
      );

      // 注册两个候选人
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      await candidateRegistration.registerCandidate(
        "ID87654321",
        "Jane Smith",
        "Republican Party",
        "Making our country great"
      );

      // 验证候选人注册是否成功
      expect(await candidateRegistration.candidateCount()).to.equal(2);

      // 验证候选人详情
      const candidate1 = await candidateRegistration.getCandidate(1);
      expect(candidate1.name).to.equal("John Doe");
      expect(candidate1.party).to.equal("Democratic Party");

      const candidate2 = await candidateRegistration.getCandidate(2);
      expect(candidate2.name).to.equal("Jane Smith");
      expect(candidate2.party).to.equal("Republican Party");

      // 验证是否可以检查候选人ID的有效性
      expect(await candidateRegistration.isValidCandidate(1)).to.be.true;
      expect(await candidateRegistration.isValidCandidate(999)).to.be.false;

      // 验证是否可以获取所有候选人ID
      const allCandidateIds = await candidateRegistration.getAllCandidateIDs();
      expect(allCandidateIds.length).to.equal(2);
      expect(allCandidateIds[0]).to.equal(1);
      expect(allCandidateIds[1]).to.equal(2);
    });

    it("Should prevent non-admin from registering candidates", async function () {
      const { candidateRegistration, voter1 } = await loadFixture(
        deployElectionSystemFixture
      );

      // 非管理员尝试注册候选人，应该失败
      await expect(
        candidateRegistration
          .connect(voter1)
          .registerCandidate(
            "ID12345678",
            "John Doe",
            "Democratic Party",
            "Building a better future"
          )
      ).to.be.revertedWith("Only election commission can perform this action");
    });

    it("Should check for duplicate candidate registrations", async function () {
      const { candidateRegistration } = await loadFixture(
        deployElectionSystemFixture
      );

      // 首次注册
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      // 使用相同的国民ID注册，应该失败
      await expect(
        candidateRegistration.registerCandidate(
          "ID12345678", // 重复的国民ID
          "John Smith",
          "Independent",
          "New vision"
        )
      ).to.be.revertedWith(
        "Candidate with this national ID already registered"
      );
    });
  });

  describe("3. Voter Registration", function () {
    it("Should register voters correctly", async function () {
      const { voterRegistration, voter1, voter2 } = await loadFixture(
        deployElectionSystemFixture
      );

      // 由管理员注册两个选民
      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );

      await voterRegistration.registerVoter(
        voter2.address,
        "ID22222222",
        "Bob"
      );

      // 验证选民注册是否成功
      expect(await voterRegistration.voterCount()).to.equal(2);
      expect(await voterRegistration.isRegisteredVoter(voter1.address)).to.be
        .true;
      expect(await voterRegistration.isRegisteredVoter(voter2.address)).to.be
        .true;

      // 验证选民的国民ID注册是否成功
      expect(await voterRegistration.isRegisteredNationalID("ID11111111")).to.be
        .true;
      expect(await voterRegistration.isRegisteredNationalID("ID99999999")).to.be
        .false;

      // 验证选民信息
      const voter1Info = await voterRegistration.voters(voter1.address);
      expect(voter1Info.isRegistered).to.be.true;
      expect(voter1Info.hasVoted).to.be.false;
      expect(voter1Info.nationalID).to.equal("ID11111111");
      expect(voter1Info.name).to.equal("Alice");
    });

    it("Should allow self-registration for testing", async function () {
      const { voterRegistration, voter3 } = await loadFixture(
        deployElectionSystemFixture
      );

      // 选民自行注册
      await voterRegistration
        .connect(voter3)
        .selfRegister("ID33333333", "Charlie");

      // 验证自行注册是否成功
      expect(await voterRegistration.isRegisteredVoter(voter3.address)).to.be
        .true;
      expect(
        await voterRegistration.getVoterNationalID(voter3.address)
      ).to.equal("ID33333333");
    });

    it("Should prevent duplicate voter registrations", async function () {
      const { voterRegistration, voter1 } = await loadFixture(
        deployElectionSystemFixture
      );

      // 首次注册
      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );

      // 尝试使用相同地址再次注册
      await expect(
        voterRegistration.registerVoter(
          voter1.address,
          "ID44444444",
          "Alice Again"
        )
      ).to.be.revertedWith("Voter already registered");

      // 尝试使用相同国民ID注册不同地址
      await expect(
        voterRegistration.registerVoter(
          "0x1234567890123456789012345678901234567890",
          "ID11111111", // 重复的国民ID
          "David"
        )
      ).to.be.revertedWith("National ID already registered");
    });
  });

  describe("4. Election Lifecycle", function () {
    it("Should follow the correct election state transitions", async function () {
      const { voting } = await loadFixture(deployElectionSystemFixture);

      // 检查初始状态是Created
      expect(await voting.state()).to.equal(0); // 0 = Created

      // 启动注册阶段
      await voting.startRegistration();
      expect(await voting.state()).to.equal(1); // 1 = Registration

      // 启动投票阶段
      await voting.startVoting(60); // 60分钟投票期
      expect(await voting.state()).to.equal(2); // 2 = Voting

      // 验证投票起始时间和结束时间
      expect(await voting.startTime()).to.not.equal(0);
      expect(await voting.endTime()).to.be.gt(await voting.startTime());

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束选举
      await voting.endElection();
      expect(await voting.state()).to.equal(3); // 3 = Ended
    });

    it("Should enforce state-based restrictions", async function () {
      const { voting } = await loadFixture(deployElectionSystemFixture);

      // 尝试在Created状态下启动投票，应该失败
      await expect(voting.startVoting(60)).to.be.revertedWith(
        "Invalid election state for this action"
      );

      // 启动注册阶段
      await voting.startRegistration();

      // 尝试在Registration状态下再次启动注册，应该失败
      await expect(voting.startRegistration()).to.be.revertedWith(
        "Invalid election state for this action"
      );

      // 启动投票阶段
      await voting.startVoting(60);

      // 尝试在Voting状态下启动注册，应该失败
      await expect(voting.startRegistration()).to.be.revertedWith(
        "Invalid election state for this action"
      );

      // 尝试在投票期间结束选举，应该失败
      await expect(voting.endElection()).to.be.revertedWith(
        "Voting period not ended yet"
      );

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束选举
      await voting.endElection();

      // 尝试在Ended状态下启动投票，应该失败
      await expect(voting.startVoting(60)).to.be.revertedWith(
        "Invalid election state for this action"
      );
    });
  });

  describe("5. Voting Process", function () {
    it("Should allow registered voters to cast votes", async function () {
      const {
        voterRegistration,
        candidateRegistration,
        voting,
        voter1,
        voter2,
      } = await loadFixture(deployElectionSystemFixture);

      // 注册候选人
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      await candidateRegistration.registerCandidate(
        "ID87654321",
        "Jane Smith",
        "Republican Party",
        "Making our country great"
      );

      // 注册选民
      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );
      await voterRegistration.registerVoter(
        voter2.address,
        "ID22222222",
        "Bob"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 选民1投票给候选人1
      await voting.connect(voter1).castVote(1);

      // 选民2投票给候选人2
      await voting.connect(voter2).castVote(2);

      // 验证投票是否成功记录
      expect(await voting.getVoteCount(1)).to.equal(1);
      expect(await voting.getVoteCount(2)).to.equal(1);

      // 验证选民是否被标记为已投票
      expect(await voterRegistration.hasVoted(voter1.address)).to.be.true;
      expect(await voterRegistration.hasVoted(voter2.address)).to.be.true;
    });

    it("Should prevent duplicate votes", async function () {
      const { voterRegistration, candidateRegistration, voting, voter1 } =
        await loadFixture(deployElectionSystemFixture);

      // 注册候选人和选民
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 选民第一次投票
      await voting.connect(voter1).castVote(1);

      // 尝试重复投票
      await expect(voting.connect(voter1).castVote(1)).to.be.revertedWith(
        "Voter has already voted"
      );
    });

    it("Should prevent unregistered voters from voting", async function () {
      const { candidateRegistration, voting, voter3 } = await loadFixture(
        deployElectionSystemFixture
      );

      // 注册候选人
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 未注册的选民尝试投票
      await expect(voting.connect(voter3).castVote(1)).to.be.revertedWith(
        "Voter not registered"
      );
    });

    it("Should prevent voting for invalid candidates", async function () {
      const { voterRegistration, candidateRegistration, voting, voter1 } =
        await loadFixture(deployElectionSystemFixture);

      // 只注册一个候选人
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      // 注册选民
      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 尝试投票给不存在的候选人
      await expect(voting.connect(voter1).castVote(999)).to.be.revertedWith(
        "Invalid candidate"
      );
    });

    it("Should prevent voting after the election has ended", async function () {
      const { voterRegistration, candidateRegistration, voting, voter1 } =
        await loadFixture(deployElectionSystemFixture);

      // 注册候选人和选民
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束投票后尝试投票
      await expect(voting.connect(voter1).castVote(1)).to.be.revertedWith(
        "Voting period has ended"
      );
    });

    it("Should allow voting by national ID (admin function)", async function () {
      const { voterRegistration, candidateRegistration, voting, admin } =
        await loadFixture(deployElectionSystemFixture);

      // 注册候选人
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      // 注册选民（只注册国民ID，不关联到具体账户）
      await voterRegistration.registerVoter(
        admin, // 下面的投票站地址无法通过 checksum, 这里用 admin 地址
        // "0xCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCcCc", // 假设的投票站地址
        "ID55555555",
        "Remote Voter"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 管理员使用国民ID代替选民投票
      await voting.castVoteByNationalID("ID55555555", 1);

      // 验证投票是否成功记录
      expect(await voting.getVoteCount(1)).to.equal(1);

      // 验证通过国民ID可以查询投票信息
      expect(await voting.getVoteByNationalID("ID55555555")).to.equal(1);
    });
  });

  describe("6. Election Results", function () {
    it("Should correctly finalize and report election results", async function () {
      const {
        voterRegistration,
        candidateRegistration,
        voting,
        electionResults,
        voter1,
        voter2,
        voter3,
      } = await loadFixture(deployElectionSystemFixture);

      // 注册候选人
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      await candidateRegistration.registerCandidate(
        "ID87654321",
        "Jane Smith",
        "Republican Party",
        "Making our country great"
      );

      // 注册选民
      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );
      await voterRegistration.registerVoter(
        voter2.address,
        "ID22222222",
        "Bob"
      );
      await voterRegistration.registerVoter(
        voter3.address,
        "ID33333333",
        "Charlie"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 投票 - 2票给候选人1，1票给候选人2
      await voting.connect(voter1).castVote(1);
      await voting.connect(voter2).castVote(1);
      await voting.connect(voter3).castVote(2);

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束选举
      await voting.endElection();

      // 不应该在选举结束前获取结果
      expect(await electionResults.resultFinalized()).to.be.false;

      // 确定结果
      await electionResults.finalizeResults();

      // 验证结果是否正确
      expect(await electionResults.resultFinalized()).to.be.true;
      expect(await electionResults.totalVotesCast()).to.equal(3);
      expect(await electionResults.winningCandidateID()).to.equal(1); // 候选人1应获胜

      // 获取获胜者详情
      const winner = await electionResults.getWinner();
      expect(winner.candidateID).to.equal(1);
      expect(winner.candidateName).to.equal("John Doe");
      expect(winner.voteCount).to.equal(2);

      // 验证所有结果
      const allResults = await electionResults.getAllResults();
      expect(allResults.length).to.equal(2);
      expect(allResults[0].candidateID).to.equal(1);
      expect(allResults[0].voteCount).to.equal(2);
      expect(allResults[1].candidateID).to.equal(2);
      expect(allResults[1].voteCount).to.equal(1);

      // 验证投票率计算
      const turnout = await electionResults.getVoterTurnout();
      expect(turnout).to.equal(100); // 3/3 = 100%
    });

    it("Should prevent finalizing results before election ends", async function () {
      const { voting, electionResults } = await loadFixture(
        deployElectionSystemFixture
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 尝试在选举结束前确定结果
      await expect(electionResults.finalizeResults()).to.be.revertedWith(
        "Election must be ended before finalizing results"
      );
    });

    it("Should prevent duplicate finalization", async function () {
      const { voting, electionResults } = await loadFixture(
        deployElectionSystemFixture
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束选举
      await voting.endElection();

      // 第一次确定结果
      await electionResults.finalizeResults();

      // 尝试重复确定结果
      await expect(electionResults.finalizeResults()).to.be.revertedWith(
        "Results already finalized"
      );
    });
  });

  describe("7. Election Verification", function () {
    it("Should allow approved auditors to verify the election", async function () {
      const {
        voterRegistration,
        candidateRegistration,
        voting,
        electionResults,
        electionVerification,
        voter1,
        auditor,
      } = await loadFixture(deployElectionSystemFixture);

      // 注册候选人和选民
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );

      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );

      // 批准审计员
      await electionVerification.approveAuditor(
        auditor.address,
        "Independent Election Monitor"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 投票
      await voting.connect(voter1).castVote(1);

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束选举并确定结果
      await voting.endElection();
      await electionResults.finalizeResults();

      // 审计员提交验证
      await electionVerification
        .connect(auditor)
        .submitVerification(
          "All votes were properly counted and the election was fair.",
          true
        );

      // 验证是否已记录验证
      expect(await electionVerification.getVerificationCount()).to.equal(1);

      // 获取验证记录
      const record = await electionVerification.getVerificationRecord(0);
      expect(record.auditor).to.equal(auditor.address);
      expect(record.comments).to.equal(
        "All votes were properly counted and the election was fair."
      );
      expect(record.verificationPassed).to.be.true;
    });

    it("Should prevent unauthorized auditors from submitting verifications", async function () {
      const { voting, electionResults, electionVerification, voter1 } =
        await loadFixture(deployElectionSystemFixture);

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束选举并确定结果
      await voting.endElection();
      await electionResults.finalizeResults();

      // 未授权用户尝试提交验证
      await expect(
        electionVerification
          .connect(voter1)
          .submitVerification("Verification comments", true)
      ).to.be.revertedWith("Only approved auditors can perform this action");
    });

    it("Should verify that vote counts match voter participation", async function () {
      const {
        voterRegistration,
        candidateRegistration,
        voting,
        electionResults,
        electionVerification,
        voter1,
        voter2,
      } = await loadFixture(deployElectionSystemFixture);

      // 注册候选人和选民
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );
      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );
      await voterRegistration.registerVoter(
        voter2.address,
        "ID22222222",
        "Bob"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 两个选民都投票
      await voting.connect(voter1).castVote(1);
      await voting.connect(voter2).castVote(1);

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束选举并确定结果
      await voting.endElection();
      await electionResults.finalizeResults();

      // 验证投票计数是否与投票人数匹配
      expect(await electionVerification.verifyVoteCounts()).to.be.true;
    });

    it("Should allow auditors to check specific votes by national ID", async function () {
      const {
        voterRegistration,
        candidateRegistration,
        voting,
        electionResults,
        electionVerification,
        voter1,
        auditor,
      } = await loadFixture(deployElectionSystemFixture);

      // 注册候选人和选民
      await candidateRegistration.registerCandidate(
        "ID12345678",
        "John Doe",
        "Democratic Party",
        "Building a better future"
      );
      await voterRegistration.registerVoter(
        voter1.address,
        "ID11111111",
        "Alice"
      );

      // 批准审计员
      await electionVerification.approveAuditor(
        auditor.address,
        "Independent Election Monitor"
      );

      // 启动选举流程
      await voting.startRegistration();
      await voting.startVoting(60);

      // 投票
      await voting.connect(voter1).castVote(1);

      // 快进时间以结束投票
      const endTime = await voting.endTime();
      await time.increaseTo(endTime);

      // 结束选举并确定结果
      await voting.endElection();
      await electionResults.finalizeResults();

      // 审计员检查特定选民的投票
      const vote = await electionVerification
        .connect(auditor)
        .checkVoteByNationalID("ID11111111");
      expect(vote).to.equal(1); // 确认选民投给了候选人1
    });
  });
});
