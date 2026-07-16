import api from "../api"


export async function getUser(query : String){

    const response = await api.get(`user/get-user?query=${query}`);
    console.log(response);
    return response;

}

export async function getUsers(query : String){

    const response = await api.get(`user/search?${query}`);
    console.log(response);
    return response;

}

export async function updateUserData( data:{
    name?: string;
    username?: string;
    profile?: string;
    bio?: string;
} ){

    const response = await api.patch(`user/update-data`, data)
    console.log(response);
    return response;

}

