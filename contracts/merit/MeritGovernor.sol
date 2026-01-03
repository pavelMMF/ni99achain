// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (merit/MeritGovernor.sol)

pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorSettings} from "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

import {MeritOracle} from "./MeritOracle.sol";
import {GovernorCountingFractionalRebalance} from "./GovernorCountingFractionalRebalance.sol";

/**
 * Topic-aware Governor:
 * - proposalId -> topicId stored on-chain (set by proposeWithTopic)
 * - weight during voting = min(tokenPastVotes, oracle cap for this topic)
 */
contract MeritGovernor is
    Governor,
    GovernorSettings,
    GovernorVotes,
    GovernorCountingFractionalRebalance,
    AccessControl
{
    bytes32 public constant VOTE_REFRESHER_ROLE = keccak256("VOTE_REFRESHER_ROLE");

    MeritOracle public immutable oracle;

    // Topic metadata
    mapping(uint256 proposalId => uint32 topicId) private _proposalTopic;

    event ProposalTopicSet(uint256 indexed proposalId, uint32 indexed topicId);

    // Auto-recast helpers
    error MeritGovernorNoExistingVote(uint256 proposalId, address account);
    error MeritGovernorUint128Overflow();

    constructor(
        IVotes token,
        MeritOracle oracle_,
        address admin,
        uint48 votingDelay_,
        uint32 votingPeriod_
    )
        Governor("MeritGovernor")
        GovernorSettings(votingDelay_, votingPeriod_, 0)
        GovernorVotes(token)
    {
        oracle = oracle_;
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(VOTE_REFRESHER_ROLE, admin);
    }

    function proposalTopic(uint256 proposalId) external view returns (uint32) {
        return _proposalTopic[proposalId];
    }

    /**
     * Create proposal with explicit topicId.
     * We embed topic into description so proposalId differs across topics.
     */
    function proposeWithTopic(
        uint32 topicId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public returns (uint256) {
        string memory wrapped = string(
            abi.encodePacked("[topic:", Strings.toString(topicId), "] ", description)
        );

        uint256 proposalId = super.propose(targets, values, calldatas, wrapped);

        _proposalTopic[proposalId] = topicId;
        emit ProposalTopicSet(proposalId, topicId);

        return proposalId;
    }

    /**
     * CORE FIX:
     * Override _castVote so ALL castVote* paths use topic-aware weight.
     */
    function _castVote(
        uint256 proposalId,
        address account,
        uint8 support,
        string memory reason,
        bytes memory params
    ) internal virtual override returns (uint256) {
        _validateStateBitmap(proposalId, _encodeStateBitmap(ProposalState.Active));

        uint256 weight = _weightForProposal(proposalId, account, params);
        uint256 used = _countVote(proposalId, account, support, weight, params);

        if (params.length == 0) {
            emit VoteCast(account, proposalId, support, used, reason);
        } else {
            emit VoteCastWithParams(account, proposalId, support, used, reason, params);
        }

        _tallyUpdated(proposalId);
        return used;
    }

    // --- Manual recast (topic-aware) ---
    function recastVote(
        uint256 proposalId,
        address account,
        uint8 support,
        bytes calldata params
    ) external onlyRole(VOTE_REFRESHER_ROLE) returns (uint256) {
        _validateStateBitmap(proposalId, _encodeStateBitmap(ProposalState.Active));

        uint256 weight = _weightForProposal(proposalId, account, params);
        uint256 used = _countVote(proposalId, account, support, weight, params);

        emit VoteCastWithParams(account, proposalId, support, used, "", params);
        _tallyUpdated(proposalId);

        return used;
    }

    // --- Auto recast (topic-aware, cap up/down) ---
    function recastVoteAuto(uint256 proposalId, address account)
        external
        onlyRole(VOTE_REFRESHER_ROLE)
        returns (uint256)
    {
        _validateStateBitmap(proposalId, _encodeStateBitmap(ProposalState.Active));

        if (!hasVoted(proposalId, account)) {
            revert MeritGovernorNoExistingVote(proposalId, account);
        }

        uint256 newWeight = _weightForProposal(proposalId, account, "");

        (uint256 aOld, uint256 fOld, uint256 abOld) = this.voteReceipt(proposalId, account);
        (bytes memory paramsScaled, uint256 effectiveWeight) = _scaleReceiptToParams(aOld, fOld, abOld, newWeight);

        uint256 usedScaled = _countVote(proposalId, account, VOTE_TYPE_FRACTIONAL, effectiveWeight, paramsScaled);

        emit VoteCastWithParams(account, proposalId, VOTE_TYPE_FRACTIONAL, usedScaled, "recastAuto", paramsScaled);
        _tallyUpdated(proposalId);

        return usedScaled;
    }

    function _scaleReceiptToParams(
        uint256 aOld,
        uint256 fOld,
        uint256 abOld,
        uint256 newWeight
    ) internal pure returns (bytes memory paramsScaled, uint256 effectiveWeight) {
        uint256 sumOld = aOld + fOld + abOld;

        if (sumOld == 0 || newWeight == 0) {
            return (abi.encodePacked(uint128(0), uint128(0), uint128(0)), 0);
        }

        effectiveWeight = newWeight;

        uint256 aNew = (aOld * effectiveWeight) / sumOld;
        uint256 fNew = (fOld * effectiveWeight) / sumOld;
        uint256 abNew = (abOld * effectiveWeight) / sumOld;

        uint256 used = aNew + fNew + abNew;
        uint256 rem = effectiveWeight - used;

        // remainder -> biggest original bucket (For > Against > Abstain)
        if (rem > 0) {
            if (fOld >= aOld && fOld >= abOld) fNew += rem;
            else if (aOld >= abOld) aNew += rem;
            else abNew += rem;
        }

        if (aNew > type(uint128).max || fNew > type(uint128).max || abNew > type(uint128).max) {
            revert MeritGovernorUint128Overflow();
        }

        paramsScaled = abi.encodePacked(uint128(aNew), uint128(fNew), uint128(abNew));
    }

    function _weightForProposal(
        uint256 proposalId,
        address account,
        bytes memory params
    ) internal view returns (uint256) {
        uint32 topicId = _proposalTopic[proposalId]; // 0 if not set
        uint256 timepoint = proposalSnapshot(proposalId);

        uint256 baseVotes = GovernorVotes._getVotes(account, timepoint, params);
        uint256 cap = oracle.weightAtTopic(account, block.timestamp, topicId);

        return baseVotes < cap ? baseVotes : cap;
    }

    // --- Required overrides ---
    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function quorum(uint256) public view override returns (uint256) {
        return 0;
    }

    // View helper only (topicId=0). Voting uses _castVote override above.
    function _getVotes(
        address account,
        uint256 timepoint,
        bytes memory params
    ) internal view override(Governor, GovernorVotes) returns (uint256) {
        uint256 baseVotes = GovernorVotes._getVotes(account, timepoint, params);
        uint256 cap0 = oracle.weightAtTopic(account, block.timestamp, 0);
        return baseVotes < cap0 ? baseVotes : cap0;
    }

    function _quorumReached(uint256 proposalId) internal view override(Governor) returns (bool) {
        (uint256 againstVotes, uint256 forVotes, ) = proposalVotes(proposalId);
        return quorum(proposalSnapshot(proposalId)) <= againstVotes + forVotes;
    }

    function _voteSucceeded(uint256 proposalId) internal view override(Governor) returns (bool) {
        (uint256 againstVotes, uint256 forVotes, ) = proposalVotes(proposalId);
        return forVotes > againstVotes;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(AccessControl, Governor)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
