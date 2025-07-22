import OrderedMap "mo:base/OrderedMap";
import Principal "mo:base/Principal";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";

module {
    public type UserRole = {
        #admin;
        #user;
        #guest;
    };

    public type ApprovalStatus = {
        #approved;
        #rejected;
        #pending;
    };

    public type MultiUserSystemState = {
        var adminAssigned : Bool;
        var userRoles : OrderedMap.Map<Principal, UserRole>;
        var approvalStatus : OrderedMap.Map<Principal, ApprovalStatus>;
    };

    public func initState() : MultiUserSystemState {
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        {
            var adminAssigned = false;
            var userRoles = principalMap.empty<UserRole>();
            var approvalStatus = principalMap.empty<ApprovalStatus>();
        };
    };

    // First principal that calls this function becomes admin, all other principals become pending users.
    public func initializeAuth(state : MultiUserSystemState, caller : Principal) {
        if (not Principal.isAnonymous(caller)) {
            let principalMap = OrderedMap.Make<Principal>(Principal.compare);
            switch (principalMap.get(state.userRoles, caller)) {
                case (?_) {};
                case (null) {
                    if (not state.adminAssigned) {
                        state.userRoles := principalMap.put(state.userRoles, caller, #admin);
                        state.approvalStatus := principalMap.put(state.approvalStatus, caller, #approved);
                        state.adminAssigned := true;
                    } else {
                        state.userRoles := principalMap.put(state.userRoles, caller, #user);
                        state.approvalStatus := principalMap.put(state.approvalStatus, caller, #pending);
                    };
                };
            };
        };
    };

    public func getApprovalStatus(state : MultiUserSystemState, caller : Principal) : ApprovalStatus {
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        switch (principalMap.get(state.approvalStatus, caller)) {
            case (?status) status;
            case null Debug.trap("User is not registered");
        };
    };

    public func getUserRole(state : MultiUserSystemState, caller : Principal) : UserRole {
        if (Principal.isAnonymous(caller)) {
            #guest;
        } else {
            let principalMap = OrderedMap.Make<Principal>(Principal.compare);
            switch (principalMap.get(state.userRoles, caller)) {
                case (?role) { role };
                case (null) {
                    Debug.trap("User is not registered");
                };
            };
        };
    };

    public func hasPermission(state : MultiUserSystemState, caller : Principal, requiredRole : UserRole, requireApproval : Bool) : Bool {
        let role = getUserRole(state, caller);
        if (requireApproval) {
            let approval = getApprovalStatus(state, caller);
            if (approval != #approved) {
                return false;
            };
        };
        switch (role) {
            case (#admin) true;
            case (role) {
                switch (requiredRole) {
                    case (#admin) false;
                    case (#user) role == #user;
                    case (#guest) true;
                };
            };
        };
    };

    public func isAdmin(state : MultiUserSystemState, caller : Principal) : Bool {
        getUserRole(state, caller) == #admin;
    };

    public func assignRole(state : MultiUserSystemState, caller : Principal, user : Principal, newRole : UserRole) {
        if (not (hasPermission(state, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only admins can assign user roles");
        };
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        state.userRoles := principalMap.put(state.userRoles, user, newRole);
    };

    public func setApproval(state : MultiUserSystemState, caller : Principal, user : Principal, approval : ApprovalStatus) {
        if (not (hasPermission(state, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only admins can approve users");
        };
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        state.approvalStatus := principalMap.put(state.approvalStatus, user, approval);
    };

    public type UserInfo = {
        principal : Principal;
        role : UserRole;
        approval : ApprovalStatus;
    };

    public func listUsers(state : MultiUserSystemState, caller : Principal) : [UserInfo] {
        if (not (hasPermission(state, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only admins can approve users");
        };
        let principalMap = OrderedMap.Make<Principal>(Principal.compare);
        let infos = principalMap.map<UserRole, UserInfo>(
            state.userRoles,
            func(principal, role) {
                let approval = getApprovalStatus(state, principal);
                let info : UserInfo = {
                    principal;
                    role;
                    approval;
                };
                info;
            }
        );
        Iter.toArray(principalMap.vals(infos));
    };
};