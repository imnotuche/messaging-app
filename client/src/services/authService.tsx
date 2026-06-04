import api from "../api";

//handles sign in
export async function signIn(user: object){

    const response = await api.post("/auth/log-in", user);
    return response;

}

//handles sign up
export async function signUp(user:object){

    const response = await api.post("/auth/sign-up", user);
    return response;

} 

export async function isLoggedIn() {
    
    const response = await api.get("/auth/logged-in");
    return response;

}