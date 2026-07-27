#[test_only]
module aptos_voting_v2::governance_tests {
    use std::signer;
    use std::vector;
    use aptos_voting_v2::governance;

    #[test(
        platform = @aptos_voting_v2,
        owner_a = @0x101,
        owner_b = @0x102,
        voter = @0x201,
    )]
    fun deterministic_organizations_have_independent_counters(
        platform: &signer,
        owner_a: &signer,
        owner_b: &signer,
        voter: &signer,
    ) {
        let (org_a, org_b) = setup_two(platform, owner_a, owner_b);
        assert!(org_a != org_b, 1001);
        assert!(governance::organization_exists(org_a), 1002);
        assert!(governance::organization_exists(org_b), 1003);
        assert!(governance::platform_organization_count() == 2, 1004);

        create_public_election(owner_a, org_a, signer::address_of(voter), 3);
        create_public_election(owner_b, org_b, signer::address_of(voter), 7);
        let (ca, pa, qa, ea) = governance::next_ids(org_a);
        let (cb, pb, qb, eb) = governance::next_ids(org_b);
        assert!(ca == 1 && pa == 1 && qa == 1 && ea == 1, 1005);
        assert!(cb == 1 && pb == 1 && qb == 1 && eb == 1, 1006);

        governance::create_category(owner_a, org_a, b"second");
        governance::create_policy(owner_a, org_a, 1, 100);
        governance::set_qualification(owner_a, org_a, 1, signer::address_of(voter), 9, true);
        governance::create_election(owner_a, org_a, 1, 1, 0, @0x0);
        let (ca2, pa2, qa2, ea2) = governance::next_ids(org_a);
        let (cb2, pb2, qb2, eb2) = governance::next_ids(org_b);
        assert!(ca2 == 2 && pa2 == 2 && qa2 == 2 && ea2 == 2, 1007);
        assert!(cb2 == 1 && pb2 == 1 && qb2 == 1 && eb2 == 1, 1008);
}
    #[test(
        platform = @aptos_voting_v2,
        owner_a = @0x101,
        owner_b = @0x102,
    )]
    #[expected_failure(abort_code = 8, location = aptos_voting_v2::governance)]
    fun cross_org_admin_is_rejected(
        platform: &signer,
        owner_a: &signer,
        owner_b: &signer,
    ) {
        let (_, org_b) = setup_two(platform, owner_a, owner_b);
        governance::create_category(owner_a, org_b, b"forbidden");
    }

    #[test(
        platform = @aptos_voting_v2,
        owner_a = @0x101,
        owner_b = @0x102,
        voter_a = @0x201,
        voter_b = @0x202,
    )]
    #[expected_failure(abort_code = 13, location = aptos_voting_v2::governance)]
    fun cross_org_vote_is_rejected(
        platform: &signer,
        owner_a: &signer,
        owner_b: &signer,
        voter_a: &signer,
        voter_b: &signer,
    ) {
        let (org_a, org_b) = setup_two(platform, owner_a, owner_b);
        create_public_election(owner_a, org_a, signer::address_of(voter_a), 3);
        create_public_election(owner_b, org_b, signer::address_of(voter_b), 7);
        governance::cast_public_ballot(voter_a, org_a, 0, 0);
        governance::cast_public_ballot(voter_a, org_b, 0, 0);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        voter = @0x201,
    )]
    #[expected_failure(abort_code = 13, location = aptos_voting_v2::governance)]
    fun platform_creator_has_no_automatic_vote(
        platform: &signer,
        owner: &signer,
        voter: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        create_public_election(owner, org, signer::address_of(voter), 5);
        governance::cast_public_ballot(platform, org, 0, 0);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        voter = @0x201,
        late_voter = @0x202,
    )]
    fun eligibility_snapshot_is_frozen(
        platform: &signer,
        owner: &signer,
        voter: &signer,
        late_voter: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        create_public_election(owner, org, signer::address_of(voter), 5);
        governance::set_qualification(owner, org, 0, signer::address_of(voter), 50, false);
        governance::set_qualification(owner, org, 0, signer::address_of(late_voter), 7, true);

        let (voter_found, voter_weight) =
            governance::election_snapshot_weight(org, 0, signer::address_of(voter));
        let (late_found, _) =
            governance::election_snapshot_weight(org, 0, signer::address_of(late_voter));
        assert!(voter_found && voter_weight == 5, 2001);
        assert!(!late_found, 2002);
        governance::cast_public_ballot(voter, org, 0, 0);
        let (yes, no, abstain, ballots) = governance::election_tallies(org, 0);
        assert!(yes == 5 && no == 0 && abstain == 0 && ballots == 1, 2003);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        voter = @0x201,
        late_voter = @0x202,
    )]
    #[expected_failure(abort_code = 13, location = aptos_voting_v2::governance)]
    fun late_qualification_cannot_join_frozen_snapshot(
        platform: &signer,
        owner: &signer,
        voter: &signer,
        late_voter: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        create_public_election(owner, org, signer::address_of(voter), 5);
        governance::set_qualification(owner, org, 0, signer::address_of(late_voter), 7, true);
        governance::cast_public_ballot(late_voter, org, 0, 0);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner_a = @0x101,
        owner_b = @0x102,
        voter = @0x201,
    )]
    fun wallet_can_vote_in_multiple_organizations(
        platform: &signer,
        owner_a: &signer,
        owner_b: &signer,
        voter: &signer,
    ) {
        let (org_a, org_b) = setup_two(platform, owner_a, owner_b);
        create_public_election(owner_a, org_a, signer::address_of(voter), 3);
        create_public_election(owner_b, org_b, signer::address_of(voter), 7);
        governance::cast_public_ballot(voter, org_a, 0, 0);
        governance::cast_public_ballot(voter, org_b, 0, 1);
        let (yes_a, no_a, _, count_a) = governance::election_tallies(org_a, 0);
        let (yes_b, no_b, _, count_b) = governance::election_tallies(org_b, 0);
        assert!(yes_a == 3 && no_a == 0 && count_a == 1, 3001);
        assert!(yes_b == 0 && no_b == 7 && count_b == 1, 3002);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        voter = @0x201,
        finalizer = @0x301,
    )]
    #[expected_failure(abort_code = 14, location = aptos_voting_v2::governance)]
    fun confidential_mode_rejects_public_ballot(
        platform: &signer,
        owner: &signer,
        voter: &signer,
        finalizer: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        create_confidential_election(
            owner,
            org,
            signer::address_of(voter),
            signer::address_of(finalizer),
        );
        governance::cast_public_ballot(voter, org, 0, 0);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        voter = @0x201,
        finalizer = @0x301,
    )]
    fun confidential_finalizer_anchors_only_commitment_and_aggregate(
        platform: &signer,
        owner: &signer,
        voter: &signer,
        finalizer: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        create_confidential_election(
            owner,
            org,
            signer::address_of(voter),
            signer::address_of(finalizer),
        );
        governance::finalize_confidential_election(finalizer, org, 0, b"root", 6, 2, 0, 1);
        let (finalized, commitment, yes, no, abstain, ballots) =
            governance::confidential_result(org, 0);
        assert!(finalized, 4001);
        assert!(vector::length(&commitment) == 4, 4002);
        assert!(*vector::borrow(&commitment, 0) == 114, 4003);
        assert!(yes == 6 && no == 2 && abstain == 0 && ballots == 1, 4004);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        voter = @0x201,
    )]
    #[expected_failure(abort_code = 27, location = aptos_voting_v2::governance)]
    fun self_registration_is_closed_by_default(
        platform: &signer,
        owner: &signer,
        voter: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        assert!(!governance::new_voters_enabled(org), 5001);
        governance::register_as_voter(voter, org);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        admin = @0x102,
        voter = @0x201,
    )]
    fun admin_controls_open_registration_and_explicit_admission(
        platform: &signer,
        owner: &signer,
        admin: &signer,
        voter: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        governance::add_admin(owner, org, signer::address_of(admin));
        governance::set_new_voters_enabled(admin, org, true);
        assert!(governance::new_voters_enabled(org), 5101);

        governance::register_as_voter(voter, org);
        assert!(governance::is_voter_admitted(org, signer::address_of(voter)), 5102);

        governance::set_voter_admission(admin, org, signer::address_of(voter), false);
        assert!(!governance::is_voter_admitted(org, signer::address_of(voter)), 5103);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        voter = @0x201,
    )]
    fun qualification_grant_admits_but_revocation_excludes_snapshot(
        platform: &signer,
        owner: &signer,
        voter: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        governance::create_category(owner, org, b"general");
        governance::create_policy(owner, org, 0, 100);
        governance::set_qualification(owner, org, 0, signer::address_of(voter), 9, true);
        assert!(governance::is_voter_admitted(org, signer::address_of(voter)), 5201);

        governance::set_voter_admission(owner, org, signer::address_of(voter), false);
        governance::create_election(owner, org, 0, 0, 0, @0x0);
        let (found, weight) =
            governance::election_snapshot_weight(org, 0, signer::address_of(voter));
        let (eligible_count, eligible_weight) = governance::election_snapshot_totals(org, 0);
        assert!(!found && weight == 0, 5202);
        assert!(eligible_count == 0 && eligible_weight == 0, 5203);
    }

    #[test(
        platform = @aptos_voting_v2,
        owner = @0x101,
        voter = @0x201,
    )]
    #[expected_failure(abort_code = 8, location = aptos_voting_v2::governance)]
    fun ordinary_voter_cannot_change_registration_policy(
        platform: &signer,
        owner: &signer,
        voter: &signer,
    ) {
        governance::initialize_for_test(platform);
        let org = create_org(platform, b"org-a", signer::address_of(owner));
        governance::set_new_voters_enabled(voter, org, true);
    }

    fun setup_two(
        platform: &signer,
        owner_a: &signer,
        owner_b: &signer,
    ): (address, address) {
        governance::initialize_for_test(platform);
        let org_a = create_org(platform, b"org-a", signer::address_of(owner_a));
        let org_b = create_org(platform, b"org-b", signer::address_of(owner_b));
        (org_a, org_b)
    }

    fun create_org(
        platform: &signer,
        seed: vector<u8>,
        owner: address,
    ): address {
        let address = governance::organization_address(signer::address_of(platform), copy_bytes(&seed));
        governance::create_organization(platform, seed, owner);
        address
    }

    fun create_public_election(
        owner: &signer,
        organization: address,
        voter: address,
        weight: u64,
    ) {
        governance::create_category(owner, organization, b"general");
        governance::create_policy(owner, organization, 0, 100);
        governance::set_qualification(owner, organization, 0, voter, weight, true);
        governance::create_election(owner, organization, 0, 0, 0, @0x0);
    }

    fun create_confidential_election(
        owner: &signer,
        organization: address,
        voter: address,
        finalizer: address,
    ) {
        governance::create_category(owner, organization, b"general");
        governance::create_policy(owner, organization, 0, 100);
        governance::set_qualification(owner, organization, 0, voter, 10, true);
        governance::create_election(owner, organization, 0, 0, 1, finalizer);
    }

    fun copy_bytes(source: &vector<u8>): vector<u8> {
        let result = vector::empty();
        let index = 0;
        while (index < vector::length(source)) {
            vector::push_back(&mut result, *vector::borrow(source, index));
            index = index + 1;
        };
        result
    }
}
