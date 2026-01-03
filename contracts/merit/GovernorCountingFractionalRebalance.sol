// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (merit/GovernorCountingFractionalRebalance.sol)

pragma solidity ^0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";


/**
 * @dev Counting module inspired by {GovernorCountingFractional} with support for replacing an existing vote.
 * When the same voter calls a casting function again, the previous contribution is removed and
 * the new split is applied. This lets offchain automation refresh votes after the daily weight
 * recomputation or cleanly switch a user's preference.
 */
abstract contract GovernorCountingFractionalRebalance is Governor {
    uint8 internal constant VOTE_TYPE_FRACTIONAL = 255;

    error GovernorExceedRemainingWeight(address voter, uint256 usedWeight, uint256 remainingWeight);

    struct VoteReceipt {
        uint256 againstVotes;
        uint256 forVotes;
        uint256 abstainVotes;
        bool hasVoted;
    }

    struct ProposalVote {
        uint256 againstVotes;
        uint256 forVotes;
        uint256 abstainVotes;
        mapping(address voter => VoteReceipt) receipts;
    }

    mapping(uint256 proposalId => ProposalVote) private _proposalVotes;

    /**
     * @dev See {IGovernor-hasVoted}.
     */
    function hasVoted(uint256 proposalId, address account) public view override returns (bool) {
        return _proposalVotes[proposalId].receipts[account].hasVoted;
    }

    /**
     * @dev Returns the current votes for `proposalId`.
     *
     * NOTE: We intentionally do NOT mark this as `override` because the exact override surface
     * differs between Governor versions/combos. It is still callable and can be used by UIs.
     */
    function proposalVotes(uint256 proposalId) public view returns (uint256, uint256, uint256) {
        ProposalVote storage details = _proposalVotes[proposalId];
        return (details.againstVotes, details.forVotes, details.abstainVotes);
    }

    /**
     * @dev See {Governor-COUNTING_MODE}.
     */
    // solhint-disable-next-line func-name-mixedcase
    function COUNTING_MODE() public pure override returns (string memory) {
        return "support=bravo&quorum=for,abstain&params=fractional";
    }

    /**
     * @dev Returns the last recorded split for `account` on `proposalId`.
     */
    function voteReceipt(
        uint256 proposalId,
        address account
    ) external view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes) {
        VoteReceipt storage receipt = _proposalVotes[proposalId].receipts[account];
        return (receipt.againstVotes, receipt.forVotes, receipt.abstainVotes);
    }

    /**
     * @dev Internal vote counting with replacement semantics.
     */
    function _countVote(
        uint256 proposalId,
        address account,
        uint8 support,
        uint256 weight,
        bytes memory params
    ) internal virtual override returns (uint256) {
        (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes) = _decodeVote(account, support, weight, params);

        ProposalVote storage details = _proposalVotes[proposalId];
        VoteReceipt storage previous = details.receipts[account];

        // Remove previous contribution when revoting.
        if (previous.hasVoted) {
            if (previous.againstVotes > 0) details.againstVotes -= previous.againstVotes;
            if (previous.forVotes > 0) details.forVotes -= previous.forVotes;
            if (previous.abstainVotes > 0) details.abstainVotes -= previous.abstainVotes;
        }

        if (againstVotes > 0) details.againstVotes += againstVotes;
        if (forVotes > 0) details.forVotes += forVotes;
        if (abstainVotes > 0) details.abstainVotes += abstainVotes;

        previous.againstVotes = againstVotes;
        previous.forVotes = forVotes;
        previous.abstainVotes = abstainVotes;
        previous.hasVoted = true;

        return againstVotes + forVotes + abstainVotes;
    }

    function _decodeVote(
        address account,
        uint8 support,
        uint256 remainingWeight,
        bytes memory params
    ) private pure returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes) {
        uint256 usedWeight;

        if (support == uint8(GovernorCountingSimple.VoteType.Against)) {
            if (params.length != 0) revert GovernorInvalidVoteParams();
            usedWeight = againstVotes = remainingWeight;
        } else if (support == uint8(GovernorCountingSimple.VoteType.For)) {
            if (params.length != 0) revert GovernorInvalidVoteParams();
            usedWeight = forVotes = remainingWeight;
        } else if (support == uint8(GovernorCountingSimple.VoteType.Abstain)) {
            if (params.length != 0) revert GovernorInvalidVoteParams();
            usedWeight = abstainVotes = remainingWeight;
        } else if (support == VOTE_TYPE_FRACTIONAL) {
            if (params.length != 0x30) revert GovernorInvalidVoteParams();

            assembly ("memory-safe") {
                againstVotes := shr(128, mload(add(params, 0x20)))
                forVotes := shr(128, mload(add(params, 0x30)))
                abstainVotes := shr(128, mload(add(params, 0x40)))
                usedWeight := add(add(againstVotes, forVotes), abstainVotes)
            }

            if (usedWeight > remainingWeight) {
                revert GovernorExceedRemainingWeight(account, usedWeight, remainingWeight);
            }
        } else {
            revert GovernorInvalidVoteType();
        }

        return (againstVotes, forVotes, abstainVotes);
    }
}

