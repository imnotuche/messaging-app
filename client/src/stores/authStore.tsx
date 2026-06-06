import { create } from "zustand";

import { signUp, signIn, isLoggedIn } from "../services/authService";
import { getUserData } from "../services/userService";

type authStoreProps = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: {
        name: string;
        username: string;
    };
    checkAuth: () => void;
    signIn: (user: object) => Promise<void>;
    signUp: (user: object) => Promise<void>;
}

export const useAuthStore = create <authStoreProps> () ((set) => ({

    isAuthenticated: false,
    isLoading: true,
    user: {
        name: "",
        username: "",
    },

    checkAuth: async() => {

        set({ isLoading: true });

        try{

            let response = await isLoggedIn();
            console.log(response)
            set({
                isAuthenticated: response.data.logged_in
            });

            response = await getUserData(response.data.payload.user.id);
            set({
                user: response.data.payload
            })

            console.log(response);

        }catch(err){
            console.log(err)
        }finally{
            set({ isLoading: false });
        }

    },

    signIn: async(user) => {

        let response;

        try{   

            response = await signIn(user);
            console.log(response);
            set({
                isAuthenticated: response.status === 200 ? true : false,
                user: response.data.user
            });

        }catch(err: any) {
            console.log(err);
        }      

    },

    signUp: async(user) => {

        let response;

        try{

            response = await signUp(user);
            set({
                isAuthenticated: response.status === 200 ? true : false,
                user: response.data.user
            });
            console.log(response.data.user);

        }catch(err:any) {
            console.log(err);
        } 

    }

}))