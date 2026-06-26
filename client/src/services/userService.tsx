import api from "../api"


export async function getUserData(id : String){

    const response = await api.get(`user/fetch-data/${id}`);
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