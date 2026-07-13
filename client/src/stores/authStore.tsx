import { create } from "zustand";

import { signUp, signIn, isLoggedIn, signOut, verifySignupCode, resendSignupCode } from "../services/authService";
import { updateUserData } from "../services/userService";
import { useCurrentProfileStore } from "./currentProfileStore";
import { useSearchStore } from "./searchStore";

type authStoreProps = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: {
        user_id: string;
        name: string;
        username: string;
        email: string;
        bio: string;
    };
    checkAuth: () => void;
    signIn: (user: object) => Promise<void>;
    signOut: () => Promise<void>;
    signUp: (user: object) => Promise<void>;
    verifySignup: (code: string) => Promise<void>;
    resendSignup: (email: string) => Promise<void>;
    update: (data: { 
        name?: string; 
        username?: string; 
        profile?: string; 
        bio?: string; 
    }) => Promise<void>;
}

export const useAuthStore = create <authStoreProps> () ((set) => ({

    isAuthenticated: false,
    isLoading: true,
    user: {
        user_id: "",
        name: "",
        username: "",
        email: "",
        bio: "",
    },

    checkAuth: async() => {

        set({ isLoading: true });

        try{

            let response = await isLoggedIn();
            console.log(response)
            set({
                isAuthenticated: response.data.logged_in,
                user: response.data.payload
            });

        }catch(err){
            console.log(err)
        }finally{
            set({ isLoading: false });
        }

    },

    signIn: async(user) => {

        try{   

            const response = await signIn(user);
            console.log(response);
            set({
                isAuthenticated: response.status === 200 ? true : false,
                user: response.data.user
            });

        }catch(err: any) {
            console.log(err);
        }      

    },

    signOut: async() => {
        
        try{

            const response = await signOut();
            const currentProfile = useCurrentProfileStore.getState();
            const currentSearch = useSearchStore.getState();

            currentProfile.clearProfileData();
            currentSearch.clearSearch();
            set({
                isAuthenticated: false,
                user: {
                    user_id: "",
                    name: "",
                    username: "",
                    email: "",
                    bio: "",
                }
            })

            console.log(response);

        }catch(err: any) {
            console.log(err);
        }  

    },

    //queues a pending signup, does not authenticate the user, verification does that
    signUp: async(user) => {

        const response = await signUp(user);
        console.log(response);

    },

    //verifies otp, promotes pending signup into a real account, backend logs the user in on success
    verifySignup: async(code) => {

        const response = await verifySignupCode(code);
        set({
            isAuthenticated: true,
            user: response.data.user
        });

    },

    //resends the otp for a pending signup, no auth state change
    resendSignup: async(email) => {

        await resendSignupCode(email);

    },

    update: async(data) => {

        try {

            const response = await updateUserData(data);
            set({
                user: response.data.payload
            });
            console.log(response.data.payload);

        }catch(err: any) {
            console.log(err);
        }

    }

}))