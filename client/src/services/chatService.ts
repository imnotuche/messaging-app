import api from "../api";

//fetch every conversation the logged in user is part of, sorted by last message time
export async function getConversations() {

    const response = await api.get(`/chat/conversations`);
    console.log(response);
    return response;

}

//lightweight refetch for a single conversation, used after the conversation_update socket ping
export async function getConversationSummary(conversationId: number) {

    const response = await api.get(`/chat/conversation-summary?conversation_id=${conversationId}`);
    console.log(response);
    return response;

}

//cursor paginated message history, omit beforeId for the first page
export async function getMessages(conversationId: number, beforeId?: number, limit = 100) {

    const params = beforeId
        ? `?conversation_id=${conversationId}&before_id=${beforeId}&limit=${limit}`
        : `?conversation_id=${conversationId}&limit=${limit}`;

    const response = await api.get(`/chat/messages${params}`);
    console.log(response);
    return response;

}

//bulk marks every unread message in a conversation as read, fired when the chat screen opens
export async function markRead(conversationId: number) {

    const response = await api.post(`/chat/mark-read?conversation_id=${conversationId}`);
    console.log(response);
    return response;

}

//catch up route, called on every socket reconnect with the last known sync timestamp
export async function syncChat(since: string) {

    const response = await api.get(`/chat/sync?since=${since}`);
    console.log(response);
    return response;

}

//get or create the conversation for a friend, used by the message button on a profile
export async function openConversation(targetUserId: string) {

    const response = await api.post(`/chat/open?target_user_id=${targetUserId}`);
    console.log(response);
    return response;

}