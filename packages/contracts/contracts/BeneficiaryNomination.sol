// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.8.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./IStaking.sol";
import "./IBeneficiaryRegistry.sol";

/** 
 @notice This contract is for submitting beneficiary nomination proposals and beneficiary takedown proposals
*/
contract BeneficiaryNomination {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  IERC20 public immutable POP;
  IStaking staking;
  IBeneficiaryRegistry beneficiaryRegistry;

  address public governance;
  /**
   * BNP for Beneficiary Nomination Proposal
   * BTP for Beneficiary Takedown Proposal
   */
  enum ProposalType {BNP, BTP}
  uint256 constant ONE_DAY = 86400; // seconds in 1 day

  enum Status {Processing, Yes, No} // status of the proposal
  enum VoteOption {Yes, No}
  struct Proposal {
    Status status;
    address beneficiary;
    mapping(address => bool) voters;
    bytes content;
    address proposer;
    address bondRecipient;
    uint256 startTime;
    uint256 yesCount;
    uint256 noCount;
    ProposalType _proposalType;
  }
  Proposal[] public proposals;

  // Proposal Id => Voter => Yes Votes
  mapping(uint256 => mapping(address => uint256)) public yesVotes;
  // Proposal Id => Voter => No Votes
  mapping(uint256 => mapping(address => uint256)) public noVotes;

  struct ConfigurationOptions {
    uint256 votingPeriod;
    uint256 vetoPeriod;
    uint256 proposalBond;
  }
  ConfigurationOptions public DefaultConfigurations;
  //modifiers
  modifier onlyGovernance {
    require(msg.sender == governance, "!governance");
    _;
  }
  modifier validAddress(address _address) {
    require(_address == address(_address), "invalid address");
    _;
  }
  modifier enoughBond(address _address) {
    require(
      POP.balanceOf(_address) >= DefaultConfigurations.proposalBond,
      "!enough bond"
    );
    _;
  }
  //events
  event GovernanceUpdated(
    address indexed _oldAddress,
    address indexed _newAddress
  );
  event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    address indexed beneficiary,
    bytes content
  );
  event Vote(
    uint256 indexed proposalId,
    address indexed voter,
    uint256 indexed weight
  );
  event Finalize(uint256 indexed proposalId);

  //constructor
  constructor(
    IStaking _staking,
    IBeneficiaryRegistry _beneficiaryRegistry,
    IERC20 _pop,
    address _governance
  ) {
    staking = _staking;
    beneficiaryRegistry = _beneficiaryRegistry;
    POP = _pop;
    governance = _governance;
    _setDefaults();
  }

  /**
   * @notice sets governance to address provided
   */
  function setGovernance(address _address)
    external
    onlyGovernance
    validAddress(_address)
  {
    address _previousGovernance = governance;
    governance = _address;
    emit GovernanceUpdated(_previousGovernance, _address);
  }

  function _setDefaults() internal {
    DefaultConfigurations.votingPeriod = 2 * ONE_DAY;
    DefaultConfigurations.vetoPeriod = 2 * ONE_DAY;
    DefaultConfigurations.proposalBond = 2000e18;
  }

  function setConfiguration(
    uint256 _votingPeriod,
    uint256 _vetoPeriod,
    uint256 _proposalBond
  ) public onlyGovernance {
    DefaultConfigurations.votingPeriod = _votingPeriod;
    DefaultConfigurations.vetoPeriod = _vetoPeriod;
    DefaultConfigurations.proposalBond = _proposalBond;
  }

  /** 
  @notice creates a beneficiary nomination proposal or a beneficiary takedown proposal
  @param  _beneficiary address of the beneficiary
  @param  _content IPFS content hash
  @return proposal id
  */
  function createProposal(
    address _beneficiary,
    bytes memory _content,
    ProposalType _type
  )
    external
    payable
    validAddress(_beneficiary)
    enoughBond(msg.sender)
    returns (uint256)
  {
    POP.safeTransferFrom(
      msg.sender,
      address(this),
      DefaultConfigurations.proposalBond
    );
    uint256 _withdrawable = 0;
    uint256 proposalId = proposals.length;

    // Create a new proposal
    proposals.push();
    Proposal storage proposal = proposals[proposalId];
    proposal.beneficiary = _beneficiary;
    proposal.content = _content;
    proposal.proposer = msg.sender;
    proposal.bondRecipient = msg.sender;
    proposal.startTime = block.timestamp;
    proposal._proposalType = _type;

    emit ProposalCreated(proposalId, msg.sender, _beneficiary, _content);

    //return proposalId;
    return _withdrawable;
  }

  /** 
  @notice votes to a specific proposal during the initial voting process
  @param  proposalId id of the proposal which you are going to vote
  @param  _voiceCredits uses to vote. Through the staking contract, where users lock their POP tokens. In return, they receive voice credits. 
  */
  function vote(
    uint256 proposalId,
    uint256 _voiceCredits,
    VoteOption _vote
  ) external {
    Proposal storage proposal = proposals[proposalId];
    if (_vote == VoteOption.Yes) {
      require(
        block.timestamp <=
          proposal.startTime.add(DefaultConfigurations.votingPeriod),
        "Initial voting period has already finished!"
      );
    }
    require(
      proposal.status == Status.Processing,
      "Proposal is already finalized"
    );
    uint256 proposalEndTime =
      proposal.startTime.add(DefaultConfigurations.votingPeriod).add(
        DefaultConfigurations.vetoPeriod
      );
    uint256 _time = block.timestamp;
    require(_time <= proposalEndTime, "Proposal is no longer in voting period");
    require(
      !proposal.voters[msg.sender],
      "address already voted for the proposal"
    );

    require(_voiceCredits > 0, "Voice credits are required");
    uint256 _stakedVoiceCredits = staking.getVoiceCredits(msg.sender);

    require(_stakedVoiceCredits > 0, "must have voice credits from staking");
    require(_voiceCredits <= _stakedVoiceCredits, "Insufficient voice credits");

    uint256 _sqredVoiceCredits = sqrt(_voiceCredits);

    proposal.voters[msg.sender] = true;
    if (_vote == VoteOption.Yes) {
      proposal.yesCount = proposal.yesCount.add(_sqredVoiceCredits);
      yesVotes[proposalId][msg.sender] = _sqredVoiceCredits;
    } else if (_vote == VoteOption.No) {
      proposal.noCount = proposal.noCount.add(_sqredVoiceCredits);
      noVotes[proposalId][msg.sender] = _sqredVoiceCredits;
    }
    emit Vote(proposalId, msg.sender, _sqredVoiceCredits);
    // Finalize the vote if no votes outnumber yes votes and open voting has ended
    if (
      _time > proposal.startTime.add(DefaultConfigurations.votingPeriod) &&
      proposal.noCount >= proposal.yesCount
    ) {
      proposal.status = Status.No;
      emit Finalize(proposalId);
    }
  }

  /**
@notice returns number of proposals that have been created
 */
  function getNumberOfProposals() external view returns (uint256) {
    return proposals.length;
  }

  /** 
  @notice checks if someone has voted to a specific proposal or not
  @param  proposalId id of the proposal
  @param  voter IPFS content hash
  @return true or false
  */
  function isVoted(uint256 proposalId, address voter)
    external
    view
    returns (bool)
  {
    return proposals[proposalId].voters[voter];
  }

  function sqrt(uint256 y) internal pure returns (uint256 z) {
    if (y > 3) {
      z = y;
      uint256 x = y / 2 + 1;
      while (x < z) {
        z = x;
        x = (y / x + x) / 2;
      }
    } else if (y != 0) {
      z = 1;
    }
  }
}
