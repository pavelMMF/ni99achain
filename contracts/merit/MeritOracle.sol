// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.4.0) (merit/MeritOracle.sol)

pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @dev Operator-driven oracle that stores the daily weight (cap) available to each address.
 * Extended: supports per-topic caps: cap(day, topicId, voter).
 *
 * Backward compatibility:
 * - pushDailyWeights(...) writes topicId=0
 * - weightAt/weightOf/contextHash read topicId=0
 */
contract MeritOracle is AccessControl {
    bytes32 public constant HYPERPARAM_ROLE = keccak256("HYPERPARAM_ROLE");
    bytes32 public constant WEIGHT_SETTER_ROLE = keccak256("WEIGHT_SETTER_ROLE");

    uint48 private constant DAY = 1 days;
    uint48 private constant SHIFT = 9 hours; // aligns the boundary to 15:00 UTC

    struct Hyperparameters {
        uint32 quota0Bps;
        uint32 quota1Bps;
        uint32 quota2Bps;
        uint32 quota3Bps;
        uint32 eduShareBps;
        uint32 floor1Bps;
        uint32 floor2Bps;
        uint32 floor3Bps;
        uint32 decay1Bps;
        uint32 decay2Bps;
        uint32 decay3Bps;
        uint48 decayPeriod;
    }

    Hyperparameters private _hyperparameters;

    // topic-aware weights
    mapping(uint48 day => mapping(uint32 topicId => mapping(address voter => uint192 weight))) private _topicWeights;
    mapping(uint48 day => mapping(uint32 topicId => bytes32 contextHash)) private _topicContextHash;

    event HyperparametersUpdated(Hyperparameters params);
    event DailyTopicWeightsUpdated(uint48 indexed day, uint32 indexed topicId, bytes32 indexed contextHash, uint256 count);

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(HYPERPARAM_ROLE, admin);
        _grantRole(WEIGHT_SETTER_ROLE, admin);
    }

    function setHyperparameters(Hyperparameters calldata params) external onlyRole(HYPERPARAM_ROLE) {
        if (params.quota0Bps + params.quota1Bps + params.quota2Bps + params.quota3Bps != 10_000) {
            revert("Invalid quota sum");
        }

        _hyperparameters = params;
        emit HyperparametersUpdated(params);
    }

    function hyperparameters() external view returns (Hyperparameters memory) {
        return _hyperparameters;
    }

    function currentDay() public view returns (uint48) {
        return dayForTimestamp(block.timestamp);
    }

    function dayForTimestamp(uint256 timestamp) public pure returns (uint48) {
        return uint48((timestamp + SHIFT) / DAY);
    }

    // --- Topic-aware API ---

    function contextHashTopic(uint48 day, uint32 topicId) external view returns (bytes32) {
        return _topicContextHash[day][topicId];
    }

    function weightAtTopic(address voter, uint256 timepoint, uint32 topicId) external view returns (uint256) {
        return _topicWeights[dayForTimestamp(timepoint)][topicId][voter];
    }

    function weightOfTopic(address voter, uint48 day, uint32 topicId) external view returns (uint256) {
        return _topicWeights[day][topicId][voter];
    }

    function pushDailyTopicWeights(
        uint48 day,
        uint32 topicId,
        address[] calldata voters,
        uint192[] calldata weights,
        bytes32 newContextHash
    ) external onlyRole(WEIGHT_SETTER_ROLE) {
        _pushDailyTopicWeights(day, topicId, voters, weights, newContextHash);
    }

    // --- Backward compatible API (topicId = 0) ---

    function contextHash(uint48 day) external view returns (bytes32) {
        return _topicContextHash[day][0];
    }

    function weightAt(address voter, uint256 timepoint) external view returns (uint256) {
        return _topicWeights[dayForTimestamp(timepoint)][0][voter];
    }

    function weightOf(address voter, uint48 day) external view returns (uint256) {
        return _topicWeights[day][0][voter];
    }

    function pushDailyWeights(
        uint48 day,
        address[] calldata voters,
        uint192[] calldata weights,
        bytes32 newContextHash
    ) external onlyRole(WEIGHT_SETTER_ROLE) {
        _pushDailyTopicWeights(day, 0, voters, weights, newContextHash);
    }

    // --- Internal implementation (so we can reuse it safely) ---

    function _pushDailyTopicWeights(
        uint48 day,
        uint32 topicId,
        address[] calldata voters,
        uint192[] calldata weights,
        bytes32 newContextHash
    ) internal {
        if (voters.length != weights.length) {
            revert("Length mismatch");
        }

        for (uint256 i = 0; i < voters.length; i++) {
            _topicWeights[day][topicId][voters[i]] = weights[i];
        }

        _topicContextHash[day][topicId] = newContextHash;
        emit DailyTopicWeightsUpdated(day, topicId, newContextHash, voters.length);
    }
}
