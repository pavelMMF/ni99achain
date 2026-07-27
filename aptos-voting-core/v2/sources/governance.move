module aptos_voting_v2::governance {
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_framework::object;
    use aptos_std::table::{Self, Table};

    const MODE_PUBLIC: u8 = 0;
    const MODE_CONFIDENTIAL: u8 = 1;

    const STATUS_OPEN: u8 = 0;
    const STATUS_FINALIZED: u8 = 1;

    const CHOICE_YES: u8 = 0;
    const CHOICE_NO: u8 = 1;
    const CHOICE_ABSTAIN: u8 = 2;

    const E_PLATFORM_ALREADY_INITIALIZED: u64 = 1;
    const E_PLATFORM_NOT_INITIALIZED: u64 = 2;
    const E_NOT_PLATFORM_CREATOR: u64 = 3;
    const E_ZERO_ADDRESS: u64 = 4;
    const E_ORGANIZATION_EXISTS: u64 = 5;
    const E_ORGANIZATION_NOT_FOUND: u64 = 6;
    const E_NOT_OWNER: u64 = 7;
    const E_NOT_ADMIN: u64 = 8;
    const E_ADMIN_EXISTS: u64 = 9;
    const E_ADMIN_NOT_FOUND: u64 = 10;
    const E_CATEGORY_NOT_FOUND: u64 = 11;
    const E_POLICY_NOT_FOUND: u64 = 12;
    const E_NOT_ELIGIBLE: u64 = 13;
    const E_WRONG_MODE: u64 = 14;
    const E_ELECTION_NOT_FOUND: u64 = 15;
    const E_ELECTION_NOT_OPEN: u64 = 16;
    const E_ALREADY_VOTED: u64 = 17;
    const E_BAD_CHOICE: u64 = 18;
    const E_NOT_FINALIZER: u64 = 19;
    const E_BAD_AGGREGATE: u64 = 20;
    const E_BAD_COMMITMENT: u64 = 21;
    const E_BAD_MODE: u64 = 22;
    const E_BAD_WEIGHT: u64 = 23;
    const E_BAD_CATEGORY: u64 = 24;
    const E_BAD_POLICY: u64 = 25;
    const E_POLICY_CATEGORY_MISMATCH: u64 = 26;
    const E_NEW_VOTERS_DISABLED: u64 = 27;
    const E_VOTER_ADMISSION_EXISTS: u64 = 28;

    struct Platform has key {
        creator: address,
        organization_count: u64,
}
    struct Organization has key {
        platform_creator: address,
        seed: vector<u8>,
        owner: address,
        admins: Table<address, bool>,
        new_voters_enabled: bool,
        voter_admissions: Table<address, bool>,
        next_category_id: u64,
        next_policy_id: u64,
        next_qualification_id: u64,
        next_election_id: u64,
        categories: Table<u64, Category>,
        policies: Table<u64, Policy>,
        qualification_keys: vector<QualificationKey>,
        qualifications: Table<QualificationKey, Qualification>,
        elections: Table<u64, Election>,
    }

    struct Category has copy, drop, store {
        id: u64,
        name: vector<u8>,
        active: bool,
    }

    struct Policy has copy, drop, store {
        id: u64,
        category_id: u64,
        max_weight: u64,
        active: bool,
    }

    struct QualificationKey has copy, drop, store {
        category_id: u64,
        account: address,
    }

    struct Qualification has copy, drop, store {
        id: u64,
        category_id: u64,
        account: address,
        weight: u64,
        eligible: bool,
    }

    struct Election has store {
        id: u64,
        category_id: u64,
        policy_id: u64,
        mode: u8,
        finalizer: address,
        status: u8,
        eligible_weights: Table<address, u64>,
        ballots: Table<address, u8>,
        eligible_count: u64,
        eligible_weight: u128,
        yes_weight: u128,
        no_weight: u128,
        abstain_weight: u128,
        ballot_count: u64,
        commitment: vector<u8>,
    }

    #[event]
    struct OrganizationCreated has drop, store {
        organization: address,
        platform_creator: address,
        owner: address,
        seed: vector<u8>,
    }

    #[event]
    struct OwnerTransferred has drop, store {
        organization: address,
        previous_owner: address,
        new_owner: address,
    }

    #[event]
    struct AdminChanged has drop, store {
        organization: address,
        actor: address,
        admin: address,
        added: bool,
    }

    #[event]
    struct NewVoterPolicyChanged has drop, store {
        organization: address,
        actor: address,
        enabled: bool,
    }

    #[event]
    struct VoterAdmissionChanged has drop, store {
        organization: address,
        actor: address,
        account: address,
        admitted: bool,
        self_registered: bool,
    }

    #[event]
    struct CategoryCreated has drop, store {
        organization: address,
        actor: address,
        category_id: u64,
    }

    #[event]
    struct PolicyCreated has drop, store {
        organization: address,
        actor: address,
        policy_id: u64,
        category_id: u64,
        max_weight: u64,
    }

    #[event]
    struct QualificationSet has drop, store {
        organization: address,
        actor: address,
        qualification_id: u64,
        category_id: u64,
        account: address,
        weight: u64,
        eligible: bool,
    }

    #[event]
    struct ElectionCreated has drop, store {
        organization: address,
        actor: address,
        election_id: u64,
        category_id: u64,
        policy_id: u64,
        mode: u8,
        finalizer: address,
        eligible_count: u64,
        eligible_weight: u128,
    }

    #[event]
    struct PublicBallotCast has drop, store {
        organization: address,
        election_id: u64,
        voter: address,
        choice: u8,
        weight: u64,
    }

    #[event]
    struct ElectionFinalized has drop, store {
        organization: address,
        election_id: u64,
        mode: u8,
        finalizer: address,
        commitment: vector<u8>,
        yes_weight: u128,
        no_weight: u128,
        abstain_weight: u128,
        ballot_count: u64,
    }

    fun init_module(platform_creator: &signer) {
        let creator = signer::address_of(platform_creator);
        assert!(creator == @aptos_voting_v2, E_NOT_PLATFORM_CREATOR);
        assert!(!exists<Platform>(@aptos_voting_v2), E_PLATFORM_ALREADY_INITIALIZED);
        move_to(platform_creator, Platform { creator, organization_count: 0 });
    }

    #[test_only]
    public fun initialize_for_test(platform_creator: &signer) {
        init_module(platform_creator);
    }

    public entry fun create_organization(
        platform_creator: &signer,
        seed: vector<u8>,
        initial_owner: address,
    ) acquires Platform {
        assert!(exists<Platform>(@aptos_voting_v2), E_PLATFORM_NOT_INITIALIZED);
        assert!(initial_owner != @0x0, E_ZERO_ADDRESS);
        let actor = signer::address_of(platform_creator);
        let platform = borrow_global_mut<Platform>(@aptos_voting_v2);
        assert!(actor == platform.creator, E_NOT_PLATFORM_CREATOR);

        let organization = object::create_object_address(&actor, copy_bytes(&seed));
        assert!(!exists<Organization>(organization), E_ORGANIZATION_EXISTS);
        let constructor_ref = object::create_named_object(platform_creator, copy_bytes(&seed));
        let object_signer = object::generate_signer(&constructor_ref);
        let object_address = signer::address_of(&object_signer);
        assert!(object_address == organization, E_ORGANIZATION_EXISTS);

        move_to(&object_signer, Organization {
            platform_creator: actor,
            seed: copy_bytes(&seed),
            owner: initial_owner,
            admins: table::new(),
            new_voters_enabled: false,
            voter_admissions: table::new(),
            next_category_id: 0,
            next_policy_id: 0,
            next_qualification_id: 0,
            next_election_id: 0,
            categories: table::new(),
            policies: table::new(),
            qualification_keys: vector::empty(),
            qualifications: table::new(),
            elections: table::new(),
        });
        platform.organization_count = platform.organization_count + 1;

        event::emit(OrganizationCreated {
            organization,
            platform_creator: actor,
            owner: initial_owner,
            seed,
        });
    }

    public entry fun transfer_owner(
        owner: &signer,
        organization: address,
        new_owner: address,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(new_owner != @0x0, E_ZERO_ADDRESS);
        let actor = signer::address_of(owner);
        let org = borrow_global_mut<Organization>(organization);
        assert!(actor == org.owner, E_NOT_OWNER);
        if (table::contains(&org.admins, new_owner)) {
            table::remove(&mut org.admins, new_owner);
        };
        let previous_owner = org.owner;
        org.owner = new_owner;
        event::emit(OwnerTransferred { organization, previous_owner, new_owner });
    }

    public entry fun add_admin(
        owner: &signer,
        organization: address,
        admin: address,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(admin != @0x0, E_ZERO_ADDRESS);
        let actor = signer::address_of(owner);
        let org = borrow_global_mut<Organization>(organization);
        assert!(actor == org.owner, E_NOT_OWNER);
        assert!(!is_admin_internal(org, admin), E_ADMIN_EXISTS);
        table::add(&mut org.admins, admin, true);
        event::emit(AdminChanged { organization, actor, admin, added: true });
    }

    public entry fun remove_admin(
        owner: &signer,
        organization: address,
        admin: address,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let actor = signer::address_of(owner);
        let org = borrow_global_mut<Organization>(organization);
        assert!(actor == org.owner, E_NOT_OWNER);
        assert!(table::contains(&org.admins, admin), E_ADMIN_NOT_FOUND);
        table::remove(&mut org.admins, admin);
        event::emit(AdminChanged { organization, actor, admin, added: false });
    }

    public entry fun set_new_voters_enabled(
        admin: &signer,
        organization: address,
        enabled: bool,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let actor = signer::address_of(admin);
        let org = borrow_global_mut<Organization>(organization);
        assert_admin(org, actor);
        org.new_voters_enabled = enabled;
        event::emit(NewVoterPolicyChanged { organization, actor, enabled });
    }

    public entry fun register_as_voter(
        voter: &signer,
        organization: address,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let actor = signer::address_of(voter);
        let org = borrow_global_mut<Organization>(organization);
        assert!(org.new_voters_enabled, E_NEW_VOTERS_DISABLED);
        assert!(!table::contains(&org.voter_admissions, actor), E_VOTER_ADMISSION_EXISTS);
        table::add(&mut org.voter_admissions, actor, true);
        event::emit(VoterAdmissionChanged {
            organization,
            actor,
            account: actor,
            admitted: true,
            self_registered: true,
        });
    }

    public entry fun set_voter_admission(
        admin: &signer,
        organization: address,
        account: address,
        admitted: bool,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(account != @0x0, E_ZERO_ADDRESS);
        let actor = signer::address_of(admin);
        let org = borrow_global_mut<Organization>(organization);
        assert_admin(org, actor);
        if (table::contains(&org.voter_admissions, account)) {
            *table::borrow_mut(&mut org.voter_admissions, account) = admitted;
        } else {
            table::add(&mut org.voter_admissions, account, admitted);
        };
        event::emit(VoterAdmissionChanged {
            organization,
            actor,
            account,
            admitted,
            self_registered: false,
        });
    }

    public entry fun create_category(
        admin: &signer,
        organization: address,
        name: vector<u8>,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(vector::length(&name) > 0, E_BAD_CATEGORY);
        let actor = signer::address_of(admin);
        let org = borrow_global_mut<Organization>(organization);
        assert_admin(org, actor);
        let id = org.next_category_id;
        org.next_category_id = id + 1;
        table::add(&mut org.categories, id, Category { id, name, active: true });
        event::emit(CategoryCreated { organization, actor, category_id: id });
    }

    public entry fun create_policy(
        admin: &signer,
        organization: address,
        category_id: u64,
        max_weight: u64,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(max_weight > 0, E_BAD_POLICY);
        let actor = signer::address_of(admin);
        let org = borrow_global_mut<Organization>(organization);
        assert_admin(org, actor);
        assert!(table::contains(&org.categories, category_id), E_CATEGORY_NOT_FOUND);
        assert!(table::borrow(&org.categories, category_id).active, E_BAD_CATEGORY);
        let id = org.next_policy_id;
        org.next_policy_id = id + 1;
        table::add(&mut org.policies, id, Policy {
            id,
            category_id,
            max_weight,
            active: true,
        });
        event::emit(PolicyCreated {
            organization,
            actor,
            policy_id: id,
            category_id,
            max_weight,
        });
    }

    public entry fun set_qualification(
        admin: &signer,
        organization: address,
        category_id: u64,
        account: address,
        weight: u64,
        eligible: bool,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(account != @0x0, E_ZERO_ADDRESS);
        assert!(!eligible || weight > 0, E_BAD_WEIGHT);
        let actor = signer::address_of(admin);
        let org = borrow_global_mut<Organization>(organization);
        assert_admin(org, actor);
        assert!(table::contains(&org.categories, category_id), E_CATEGORY_NOT_FOUND);

        let key = QualificationKey { category_id, account };
        let qualification_id = if (table::contains(&org.qualifications, key)) {
            let qualification = table::borrow_mut(&mut org.qualifications, key);
            qualification.weight = weight;
            qualification.eligible = eligible;
            qualification.id
        } else {
            let id = org.next_qualification_id;
            org.next_qualification_id = id + 1;
            vector::push_back(&mut org.qualification_keys, key);
            table::add(&mut org.qualifications, key, Qualification {
                id,
                category_id,
                account,
                weight,
                eligible,
            });
            id
        };

        if (eligible && !is_voter_admitted_internal(org, account)) {
            if (table::contains(&org.voter_admissions, account)) {
                *table::borrow_mut(&mut org.voter_admissions, account) = true;
            } else {
                table::add(&mut org.voter_admissions, account, true);
            };
            event::emit(VoterAdmissionChanged {
                organization,
                actor,
                account,
                admitted: true,
                self_registered: false,
            });
        };

        event::emit(QualificationSet {
            organization,
            actor,
            qualification_id,
            category_id,
            account,
            weight,
            eligible,
        });
    }

    public entry fun create_election(
        admin: &signer,
        organization: address,
        category_id: u64,
        policy_id: u64,
        mode: u8,
        finalizer: address,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(mode == MODE_PUBLIC || mode == MODE_CONFIDENTIAL, E_BAD_MODE);
        assert!(mode != MODE_CONFIDENTIAL || finalizer != @0x0, E_ZERO_ADDRESS);
        let actor = signer::address_of(admin);
        let org = borrow_global_mut<Organization>(organization);
        assert_admin(org, actor);
        assert!(table::contains(&org.categories, category_id), E_CATEGORY_NOT_FOUND);
        assert!(table::borrow(&org.categories, category_id).active, E_BAD_CATEGORY);
        assert!(table::contains(&org.policies, policy_id), E_POLICY_NOT_FOUND);
        let policy = table::borrow(&org.policies, policy_id);
        assert!(policy.active, E_BAD_POLICY);
        assert!(policy.category_id == category_id, E_POLICY_CATEGORY_MISMATCH);
        let max_weight = policy.max_weight;

        let eligible_weights = table::new<address, u64>();
        let eligible_count = 0;
        let eligible_weight = 0;
        let index = 0;
        while (index < vector::length(&org.qualification_keys)) {
            let key = *vector::borrow(&org.qualification_keys, index);
            if (key.category_id == category_id) {
                let qualification = table::borrow(&org.qualifications, key);
                if (qualification.eligible && is_voter_admitted_internal(org, key.account)) {
                    let snapshot_weight = if (qualification.weight > max_weight) {
                        max_weight
                    } else {
                        qualification.weight
                    };
                    if (snapshot_weight > 0) {
                        table::add(&mut eligible_weights, key.account, snapshot_weight);
                        eligible_count = eligible_count + 1;
                        eligible_weight = eligible_weight + (snapshot_weight as u128);
                    };
                };
            };
            index = index + 1;
        };

        let id = org.next_election_id;
        org.next_election_id = id + 1;
        table::add(&mut org.elections, id, Election {
            id,
            category_id,
            policy_id,
            mode,
            finalizer,
            status: STATUS_OPEN,
            eligible_weights,
            ballots: table::new(),
            eligible_count,
            eligible_weight,
            yes_weight: 0,
            no_weight: 0,
            abstain_weight: 0,
            ballot_count: 0,
            commitment: vector::empty(),
        });
        event::emit(ElectionCreated {
            organization,
            actor,
            election_id: id,
            category_id,
            policy_id,
            mode,
            finalizer,
            eligible_count,
            eligible_weight,
        });
    }

    public entry fun cast_public_ballot(
        voter: &signer,
        organization: address,
        election_id: u64,
        choice: u8,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(choice <= CHOICE_ABSTAIN, E_BAD_CHOICE);
        let voter_address = signer::address_of(voter);
        let org = borrow_global_mut<Organization>(organization);
        assert!(table::contains(&org.elections, election_id), E_ELECTION_NOT_FOUND);
        let election = table::borrow_mut(&mut org.elections, election_id);
        assert!(election.mode == MODE_PUBLIC, E_WRONG_MODE);
        assert!(election.status == STATUS_OPEN, E_ELECTION_NOT_OPEN);
        assert!(table::contains(&election.eligible_weights, voter_address), E_NOT_ELIGIBLE);
        assert!(!table::contains(&election.ballots, voter_address), E_ALREADY_VOTED);
        let weight = *table::borrow(&election.eligible_weights, voter_address);
        table::add(&mut election.ballots, voter_address, choice);
        election.ballot_count = election.ballot_count + 1;
        if (choice == CHOICE_YES) {
            election.yes_weight = election.yes_weight + (weight as u128);
        } else if (choice == CHOICE_NO) {
            election.no_weight = election.no_weight + (weight as u128);
        } else {
            election.abstain_weight = election.abstain_weight + (weight as u128);
        };
        event::emit(PublicBallotCast {
            organization,
            election_id,
            voter: voter_address,
            choice,
            weight,
        });
    }

    public entry fun finalize_public_election(
        admin: &signer,
        organization: address,
        election_id: u64,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let actor = signer::address_of(admin);
        let org = borrow_global_mut<Organization>(organization);
        assert_admin(org, actor);
        assert!(table::contains(&org.elections, election_id), E_ELECTION_NOT_FOUND);
        let election = table::borrow_mut(&mut org.elections, election_id);
        assert!(election.mode == MODE_PUBLIC, E_WRONG_MODE);
        assert!(election.status == STATUS_OPEN, E_ELECTION_NOT_OPEN);
        election.status = STATUS_FINALIZED;
        event::emit(ElectionFinalized {
            organization,
            election_id,
            mode: MODE_PUBLIC,
            finalizer: actor,
            commitment: vector::empty(),
            yes_weight: election.yes_weight,
            no_weight: election.no_weight,
            abstain_weight: election.abstain_weight,
            ballot_count: election.ballot_count,
        });
    }

    public entry fun finalize_confidential_election(
        finalizer: &signer,
        organization: address,
        election_id: u64,
        commitment: vector<u8>,
        yes_weight: u128,
        no_weight: u128,
        abstain_weight: u128,
        ballot_count: u64,
    ) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        assert!(vector::length(&commitment) > 0, E_BAD_COMMITMENT);
        let actor = signer::address_of(finalizer);
        let org = borrow_global_mut<Organization>(organization);
        assert!(table::contains(&org.elections, election_id), E_ELECTION_NOT_FOUND);
        let election = table::borrow_mut(&mut org.elections, election_id);
        assert!(election.mode == MODE_CONFIDENTIAL, E_WRONG_MODE);
        assert!(election.status == STATUS_OPEN, E_ELECTION_NOT_OPEN);
        assert!(actor == election.finalizer, E_NOT_FINALIZER);
        let aggregate_weight = yes_weight + no_weight + abstain_weight;
        assert!(ballot_count <= election.eligible_count, E_BAD_AGGREGATE);
        assert!(aggregate_weight <= election.eligible_weight, E_BAD_AGGREGATE);
        election.status = STATUS_FINALIZED;
        election.yes_weight = yes_weight;
        election.no_weight = no_weight;
        election.abstain_weight = abstain_weight;
        election.ballot_count = ballot_count;
        election.commitment = copy_bytes(&commitment);
        event::emit(ElectionFinalized {
            organization,
            election_id,
            mode: MODE_CONFIDENTIAL,
            finalizer: actor,
            commitment,
            yes_weight,
            no_weight,
            abstain_weight,
            ballot_count,
        });
    }

    #[view]
    public fun organization_address(platform_creator: address, seed: vector<u8>): address {
        object::create_object_address(&platform_creator, seed)
    }

    #[view]
    public fun organization_exists(organization: address): bool {
        exists<Organization>(organization)
    }

    #[view]
    public fun platform_organization_count(): u64 acquires Platform {
        assert!(exists<Platform>(@aptos_voting_v2), E_PLATFORM_NOT_INITIALIZED);
        borrow_global<Platform>(@aptos_voting_v2).organization_count
    }

    #[view]
    public fun organization_owner(organization: address): address acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        borrow_global<Organization>(organization).owner
    }

    #[view]
    public fun is_admin(organization: address, account: address): bool acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        is_admin_internal(borrow_global<Organization>(organization), account)
    }

    #[view]
    public fun new_voters_enabled(organization: address): bool acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        borrow_global<Organization>(organization).new_voters_enabled
    }

    #[view]
    public fun is_voter_admitted(
        organization: address,
        account: address,
    ): bool acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        is_voter_admitted_internal(borrow_global<Organization>(organization), account)
    }

    #[view]
    public fun next_ids(organization: address): (u64, u64, u64, u64) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let org = borrow_global<Organization>(organization);
        (
            org.next_category_id,
            org.next_policy_id,
            org.next_qualification_id,
            org.next_election_id,
        )
    }

    #[view]
    public fun qualification_of(
        organization: address,
        category_id: u64,
        account: address,
    ): (bool, u64, u64, bool) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let org = borrow_global<Organization>(organization);
        let key = QualificationKey { category_id, account };
        if (!table::contains(&org.qualifications, key)) return (false, 0, 0, false);
        let qualification = table::borrow(&org.qualifications, key);
        (true, qualification.id, qualification.weight, qualification.eligible)
    }

    #[view]
    public fun election_snapshot_weight(
        organization: address,
        election_id: u64,
        account: address,
    ): (bool, u64) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let org = borrow_global<Organization>(organization);
        assert!(table::contains(&org.elections, election_id), E_ELECTION_NOT_FOUND);
        let election = table::borrow(&org.elections, election_id);
        if (!table::contains(&election.eligible_weights, account)) return (false, 0);
        (true, *table::borrow(&election.eligible_weights, account))
    }

    #[view]
    public fun election_snapshot_totals(
        organization: address,
        election_id: u64,
    ): (u64, u128) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let org = borrow_global<Organization>(organization);
        assert!(table::contains(&org.elections, election_id), E_ELECTION_NOT_FOUND);
        let election = table::borrow(&org.elections, election_id);
        (election.eligible_count, election.eligible_weight)
    }

    #[view]
    public fun election_tallies(
        organization: address,
        election_id: u64,
    ): (u128, u128, u128, u64) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let org = borrow_global<Organization>(organization);
        assert!(table::contains(&org.elections, election_id), E_ELECTION_NOT_FOUND);
        let election = table::borrow(&org.elections, election_id);
        (
            election.yes_weight,
            election.no_weight,
            election.abstain_weight,
            election.ballot_count,
        )
    }

    #[view]
    public fun election_mode_and_status(
        organization: address,
        election_id: u64,
    ): (u8, u8, address) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let org = borrow_global<Organization>(organization);
        assert!(table::contains(&org.elections, election_id), E_ELECTION_NOT_FOUND);
        let election = table::borrow(&org.elections, election_id);
        (election.mode, election.status, election.finalizer)
    }

    #[view]
    public fun confidential_result(
        organization: address,
        election_id: u64,
    ): (bool, vector<u8>, u128, u128, u128, u64) acquires Organization {
        assert!(exists<Organization>(organization), E_ORGANIZATION_NOT_FOUND);
        let org = borrow_global<Organization>(organization);
        assert!(table::contains(&org.elections, election_id), E_ELECTION_NOT_FOUND);
        let election = table::borrow(&org.elections, election_id);
        assert!(election.mode == MODE_CONFIDENTIAL, E_WRONG_MODE);
        (
            election.status == STATUS_FINALIZED,
            copy_bytes(&election.commitment),
            election.yes_weight,
            election.no_weight,
            election.abstain_weight,
            election.ballot_count,
        )
    }

    fun is_voter_admitted_internal(org: &Organization, account: address): bool {
        if (!table::contains(&org.voter_admissions, account)) return false;
        *table::borrow(&org.voter_admissions, account)
    }

    fun assert_admin(org: &Organization, account: address) {
        assert!(is_admin_internal(org, account), E_NOT_ADMIN);
    }

    fun is_admin_internal(org: &Organization, account: address): bool {
        account == org.owner || table::contains(&org.admins, account)
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
