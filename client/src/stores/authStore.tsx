import { create } from "zustand";

import { signUp, signIn, isLoggedIn, signOut } from "../services/authService";
import { updateUserData } from "../services/userService";

type authStoreProps = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: {
        name: string;
        username: string;
        email: string;
        bio: string;
    };
    checkAuth: () => void;
    signIn: (user: object) => Promise<void>;
    signOut: () => Promise<void>;
    signUp: (user: object) => Promise<void>;
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
            set({
                isAuthenticated: false,
                user: {
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

    signUp: async(user) => {

        try{

            const response = await signUp(user);
            set({
                isAuthenticated: response.status === 200 ? true : false,
                user: response.data.user
            });
            console.log(response.data.user);

        }catch(err:any) {
            console.log(err);
        } 

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