import api from "../api";

//handles sign in
export async function signIn(user: object){

    const response = await api.post("/auth/log-in", user);
    return response;

}

//handles signout
export async function signOut(){

    const response = await api.post("/auth/log-out");
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

//verifies the otp for a pending signup, promotes user, logs them in
export async function verifySignupCode(code: string){

    const response = await api.post("/auth/signup/verify-code", { code });
    return response;

}

//resends the otp for a pending signup
export async function resendSignupCode(email: string){

    const response = await api.post("/auth/signup/resend-code", { email });
    return response;

}

//checks if a signup verification is currently pending, recovers email after refresh
export async function getSignupStatus(){

    const response = await api.get("/auth/signup/verify-status");
    return response;

}