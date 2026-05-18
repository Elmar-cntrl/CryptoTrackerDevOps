import * as signalR from "@microsoft/signalr";

export function createNotificationConnection() {
    const token = localStorage.getItem("token");

    return new signalR.HubConnectionBuilder()
        .withUrl("/hubs/notifications", {
            accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();
}