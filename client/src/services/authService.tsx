import api from "../api";

//handles sign in
export async function signIn(user: object){

    const response = await api.post("/auth/log-in", user);
    console.log(response.data);
    return response.data;

}

//handles sign up
export async function signUp(user:object){

    const response = await api.post("/auth/sign-up", user);
    console.log(response.data);
    return response.data

} 