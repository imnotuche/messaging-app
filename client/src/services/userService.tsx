import api from "../api"


export async function getUserData(id : String){

    const response = await api.get(`user/fetch-data/${id}`);
    console.log(response);
    return response;

}