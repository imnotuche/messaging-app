import api from "../api"

//get the friends of the current logged in user
export async function getFriends(){

    const response = await api.get(`/friends/get-friends`);
    console.log(response);
    return response;

}

//search within the current logged in user's friends by name/username
export async function searchFriends(query : string) {
    const response = await api.get(`/friends/search-friends?query=${query}`)
    console.log(response);
    return response;
}

//get the friendship status between the current logged in user and another user by their id
export async function getFriendshipStatus(targetId : string){

    const response = await api.get(`/friends/get-relationship-status?target_id=${targetId}`);
    console.log(response);
    return response;

}

export async function getMutualFriendCount(targetId : string){

    const response = await api.get(`/friends//get-mutual-friends-count?target_id=${targetId}`);
    console.log(response);
    return response;

}

//send friend request to a user
export async function sendFriendRequest(userId : string, sendTo : string) {

    const response = await api.post(`/friends/send-request?user_id=${userId}&send_to=${sendTo}`)
    console.log(response);
    return response;

}

//cancel friend request previously sent to a user
export async function cancelFriendRequest(userId : string, sendTo : string) {

    const response = await api.post(`/friends/cancel-request?user_id=${userId}&send_to=${sendTo}`)
    console.log(response);
    return response;

}

//accept friend request sent from a user
export async function acceptFriendRequest(userId : string, sentFrom : string) {

    const response = await api.post(`/friends/accept-request?user_id=${userId}&sent_from=${sentFrom}`)
    console.log(response);
    return response;

}

//unfriend user
export async function unfriend(userId : string, friendId : string) {

    const response = await api.post(`/friends/unfriend?user_id=${userId}&friend_id=${friendId}`)
    console.log(response);
    return response;

}

//block a user
export async function blockUser(userId : string, blockUserId : string) {

    const response = await api.post(`/friends/block-user?user_id=${userId}&block_user_id=${blockUserId}`)
    console.log(response);
    return response;

}

//unblock a previously locked user
export async function unBlockUser(userId : string, unblockUserId : string) {

    const response = await api.post(`/friends/unblock-user?user_id=${userId}&unblock_user_id=${unblockUserId}`)
    console.log(response);
    return response;

}