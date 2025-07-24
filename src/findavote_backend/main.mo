import MultiUserSystem "./management";
import OrderedMap "mo:base/OrderedMap";
import Principal "mo:base/Principal";
import FileStorage "./file-storage";
import Http "./http";
import Text "mo:base/Text";
import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

persistent actor {
    // Initialize the multi-user system state
    let multiUserState = MultiUserSystem.initState();

    // Initialize auth (first caller becomes admin, others become users)
    public shared ({ caller }) func initializeAuth() : async () {
        MultiUserSystem.initializeAuth(multiUserState, caller);
    };

    public query ({ caller }) func getCurrentUserRole() : async MultiUserSystem.UserRole {
        MultiUserSystem.getUserRole(multiUserState, caller);
    };

    public query ({ caller }) func isCurrentUserAdmin() : async Bool {
        MultiUserSystem.isAdmin(multiUserState, caller);
    };

    // Requires admin privilege to execute
    public shared ({ caller }) func assignRole(user : Principal, newRole : MultiUserSystem.UserRole) : async () {
        MultiUserSystem.assignRole(multiUserState, caller, user, newRole);
    };

    // Requires admin privilege to execute
    public shared ({ caller }) func setApproval(user : Principal, approval : MultiUserSystem.ApprovalStatus) : async () {
        MultiUserSystem.setApproval(multiUserState, caller, user, approval);
    };

    // Requires admin privilege to execute
    public query ({ caller }) func getApproval(user : Principal) : async MultiUserSystem.ApprovalStatus {
        MultiUserSystem.getApprovalStatus(multiUserState, caller);
    };

    public query ({ caller }) func listUsers() : async [MultiUserSystem.UserInfo] {
        MultiUserSystem.listUsers(multiUserState, caller);
    };

    public type UserProfile = {
        name : Text;
        // Other user's metadata if needed
    };

    transient let principalMap = OrderedMap.Make<Principal>(Principal.compare);
    var userProfiles = principalMap.empty<UserProfile>();

    public query ({ caller }) func getUserProfile() : async ?UserProfile {
        principalMap.get(userProfiles, caller);
    };

    public shared ({ caller }) func saveUserProfile(profile : UserProfile) : async () {
        userProfiles := principalMap.put(userProfiles, caller, profile);
    };

    // Application-specific code
    // Guard public functions as follows:
    // * Admin-only:
    //   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
    //      Debug.trap("Unauthorized: Only approved users and admins delete data");
    //   };
    // * Only approved users:
    //   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, true))) {
    //      Debug.trap("Unauthorized: Only approved users and admins delete data");
    //   };
    // * Any logged-in user (no approval needed):
    //   if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
    //      Debug.trap("Unauthorized: Only approved users and admins delete data");
    //   };
    // * Unlimited access, including guests: No check

    // File storage
    var storage = FileStorage.new();

    public func list() : async [FileStorage.FileMetadata] {
        FileStorage.list(storage);
    };

    public func upload(path : Text, mimeType : Text, chunk : Blob, complete : Bool) : async () {
        FileStorage.upload(storage, path, mimeType, chunk, complete);
    };

    public query func http_request(request : Http.HttpRequest) : async Http.HttpResponse {
        FileStorage.fileRequest(storage, request, httpStreamingCallback);
    };

    public query func httpStreamingCallback(token : Http.StreamingToken) : async Http.StreamingCallbackHttpResponse {
        FileStorage.httpStreamingCallback(storage, token);
    };

    // FindaVote-specific code
    public type Post = {
        id : Nat;
        title : Text;
        description : Text;
        imagePath : Text;
        author : Principal;
        timestamp : Int;
    };

    transient let natMap = OrderedMap.Make<Nat>(Nat.compare);
    var posts = natMap.empty<Post>();
    var nextPostId : Nat = 0;

    public shared ({ caller }) func createPost(title : Text, description : Text, imagePath : Text) : async Nat {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only logged-in users can create posts");
        };

        // Check if user already has a post
        let existingPosts = await getPostsByAuthor(caller);
        if (existingPosts.size() > 0) {
            Debug.trap("You already have a post. Please delete your existing post before creating a new one.");
        };

        let postId = nextPostId;
        nextPostId += 1;

        let newPost : Post = {
            id = postId;
            title = title;
            description = description;
            imagePath = imagePath;
            author = caller;
            timestamp = Time.now();
        };

        posts := natMap.put(posts, postId, newPost);
        postId;
    };

    public query func getPost(postId : Nat) : async ?Post {
        natMap.get(posts, postId);
    };

    public query func getAllPosts() : async [Post] {
        Iter.toArray(natMap.vals(posts));
    };

    public shared ({ caller }) func deletePost(postId : Nat) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #user, false))) {
            Debug.trap("Unauthorized: Only logged-in users can delete their posts");
        };

        let (updatedPosts, removedPost) = natMap.remove(posts, postId);
        posts := updatedPosts;

        switch (removedPost) {
            case null { Debug.trap("Post not found") };
            case (?post) {
                if (post.author != caller) {
                    Debug.trap("Unauthorized: You can only delete your own posts");
                };
                // Optionally delete the associated image
                FileStorage.delete(storage, post.imagePath);
            };
        };
    };

    public shared ({ caller }) func setPaymentAddress(address : Text) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only super admins can set payment address");
        };
        paymentAddress := address;
    };

    var paymentAddress : Text = "";

    public query func getPaymentAddress() : async Text {
        paymentAddress;
    };

    public shared ({ caller }) func promoteToAdmin(user : Principal) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only super admins can promote admins");
        };
        MultiUserSystem.assignRole(multiUserState, caller, user, #admin);
    };

    public shared ({ caller }) func demoteAdmin(user : Principal) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only super admins can demote admins");
        };
        MultiUserSystem.assignRole(multiUserState, caller, user, #user);
    };

    public shared ({ caller }) func removePost(postId : Nat) : async () {
        if (not (MultiUserSystem.hasPermission(multiUserState, caller, #admin, true))) {
            Debug.trap("Unauthorized: Only admins can remove posts");
        };

        let (updatedPosts, removedPost) = natMap.remove(posts, postId);
        posts := updatedPosts;

        switch (removedPost) {
            case null { Debug.trap("Post not found") };
            case (?post) {
                FileStorage.delete(storage, post.imagePath);
            };
        };
    };

    public shared ({ caller }) func createPostWithPayment(title : Text, description : Text, imagePath : Text) : async Nat {
        // Payment verification logic would go here
        // For now, we just create the post
        await createPost(title, description, imagePath);
    };

    public query func getPostsByAuthor(author : Principal) : async [Post] {
        let allPosts = Iter.toArray(natMap.vals(posts));
        Array.filter<Post>(allPosts, func(post) { Principal.equal(post.author, author) });
    };

    public query func getPostCount() : async Nat {
        natMap.size(posts);
    };
};