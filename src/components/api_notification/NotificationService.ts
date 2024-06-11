import { Observable} from "rxjs";
import { of } from 'rxjs';

type ISOString = string
type Notification = {
    title: string,
    message: string,
    date: ISOString,
    prority: 'low'|'medium'|'high',
    read: boolean
}

let notifications: Notification[];

export class NotificationService {
    send(notification: Notification) {
        notifications.push(notification);
    }
    list():Observable<Notification[]> {
        return of(notifications)
    }
    unreadCount(): Observable<number> {
        const unreadCount = notifications.filter(notification => !notification.read).length;
        return of(unreadCount);
    }
}