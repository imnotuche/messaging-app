import api from "../api"

//fetch a page of notifications, pass a cursor to page further back, omit both for the first page
export async function getNotifications(beforeCreatedAt?: string, beforeId?: number) {

    const params = beforeCreatedAt && beforeId
        ? `?before_created_at=${beforeCreatedAt}&before_id=${beforeId}`
        : "";

    const response = await api.get(`/notifications${params}`);
    console.log(response);
    return response;

}

//mark a single notification read, used on click
export async function markNotificationRead(notificationId: number) {

    const response = await api.post(`/notifications/${notificationId}/read`);
    console.log(response);
    return response;

}

//mark a batch of notifications read, used after the dropdown has been open a moment
export async function markNotificationsReadBatch(ids: number[]) {

    const response = await api.post(`/notifications/read-batch`, { ids });
    console.log(response);
    return response;

}