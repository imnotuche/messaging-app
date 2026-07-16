import { create } from "zustand";
import { getUser } from "../services/userService";
import { useAuthStore } from "./authStore";
import { useFriendsStore } from "./friendStore";
import { 
    getFriendshipStatus,
    getMutualFriendCount,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    unfriend,
    blockUser,
    unBlockUser, 
} from "../services/friendService";

const friendServicesMap = {
    send_request: sendFriendRequest,
    cancel_request: cancelFriendRequest,
    accept_request: acceptFriendRequest,
    unfriend: unfriend,
    block: blockUser,
    unblock: unBlockUser,
};

type UserProfileData = {
    user_id: string;
    name: string;
    username: string;
    email: string;
    bio: string;
    profile: string;
    isOnline: boolean;
    lastSeen: string;
    mutualFriendsCount: number;
};

type FriendshipStatus = "none" | "pending_outgoing" | "pending_incoming" | "friends" | "blocked_by_me" | "blocked_by_them";
type ProfileAction = keyof typeof friendServicesMap;

const FRIENDSHIP_RULES: Record<FriendshipStatus, ProfileAction[]> = {
    none: ["send_request", "block"],
    pending_outgoing: ["cancel_request", "block"],
    pending_incoming: ["accept_request", "block"],
    friends: ["unfriend", "block"],
    blocked_by_me: ["unblock"], 
    blocked_by_them: [],
};

type ProfileState = {
    user: UserProfileData | null;
    friendshipStatus: FriendshipStatus;
    isLoading: boolean;
    executeAction: (action: ProfileAction) => Promise<void>; 
    getAllowedActions: () => ProfileAction[];
    setProfileData: (query: string) => Promise<void>;
    clearProfileData: () => void;
}

export const useCurrentProfileStore = create<ProfileState>((set, get) => ({

    user: null,
    friendshipStatus: "none",
    isLoading: false,

    executeAction: async (action: ProfileAction) => {

        //get allowed action for current relationship state
        const allowed = get().getAllowedActions();
        
        // Security guard: Reject execution if the client tries to fire an illegal action
        if (!allowed.includes(action)) {
            console.warn(`Action '${action}' is strictly forbidden while state is '${get().friendshipStatus}'`);
            return;
        }

        const auth = useAuthStore.getState();
        const targetUser = get().user;
        if (!targetUser) return;
        const serviceRunner = friendServicesMap[action];

        try {

            const response = await serviceRunner(auth.user.user_id, targetUser.user_id);

            // Optimistically update the local friendship state to match the result of the action
            let nextStatus: FriendshipStatus = "none";
            if (action === "send_request") nextStatus = "pending_outgoing";
            if (action === "accept_request") nextStatus = "friends";
            if (action === "cancel_request") nextStatus = "none";
            if (action === "unfriend") nextStatus = "none";
            if (action === "block") nextStatus = "blocked_by_me";

            //unblock can restore to any prior relationship, so deduce it from what the backend returned
            if (action === "unblock") {

                const restoredStatus = response.data.status;
                const restoredLastAction = response.data.last_action;

                if (restoredStatus === "friends") {

                    nextStatus = "friends";

                } else if (restoredStatus === "pending") {

                    nextStatus = restoredLastAction === auth.user.user_id ? "pending_outgoing" : "pending_incoming";

                } else {

                    nextStatus = "none";

                }

            }

            //keep friendsStore in sync with what just happened here, no extra network calls
            if (action === "unfriend") {

                useFriendsStore.getState().syncRemoveFriend(targetUser.user_id);

            }

            if (action === "accept_request") {

                useFriendsStore.getState().syncAddFriend({
                    id: targetUser.user_id,
                    name: targetUser.name,
                    email: targetUser.email,
                    username: targetUser.username,
                    profile: targetUser.profile,
                    bio: targetUser.bio,
                    last_seen: targetUser.lastSeen,
                });

            }

            set({ friendshipStatus: nextStatus });

        } catch (error) {
            console.error(`Failed executing interaction sequence: ${action}`, error);
        }
    },

    getAllowedActions: () => {
        const status = get().friendshipStatus;
        return FRIENDSHIP_RULES[status] || [];
    },

    setProfileData: async (query: string) => {

        set({ isLoading: true });

        try {      
            const [response, response2, response3] = await Promise.all([

                //get user data
                getUser(query),

                //get friendship status
                getFriendshipStatus(query),

                //get mutual friends count
                getMutualFriendCount(query)
            ])

            console.log(response);
            console.log(response2);
            console.log(response3);


            const auth = useAuthStore.getState();
            
            const rawStatus = response2.data.status;
            const lastActionUser = response2.data.last_action;
            
            let deducedStatus: FriendshipStatus = "none";

            if (rawStatus === "friends") {

                deducedStatus = "friends";

            } else if (rawStatus === "pending") {

                deducedStatus = lastActionUser === auth.user.user_id ? "pending_outgoing" : "pending_incoming";

            } else if (rawStatus === "blocked") {

                deducedStatus = lastActionUser === auth.user.user_id ? "blocked_by_me" : "blocked_by_them";

            }

            //set user object and friendship status
            set({
                user : { ...response.data.payload, mutualFriendsCount: response3.data.mutual_count }, 
                friendshipStatus: deducedStatus,
            })
        } catch (error) {
            console.error("Failed to fetch connection status in profileStore:", error);
            set({ user: null });
        } finally {
            set({ isLoading: false });
        }
    },

    clearProfileData: () => {
        set({ user: null, friendshipStatus: "none" });
    }
    
}));