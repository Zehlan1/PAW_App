import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

type ISOString = string;

type Notification = {
  title: string;
  message: string;
  date: ISOString;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
};

export class NotificationService {
  private notifications: Notification[] = [];
  private notificationsSubject: BehaviorSubject<Notification[]> = new BehaviorSubject(this.notifications);

  send(notification: Notification): void {
    this.notifications.push(notification);
    this.notificationsSubject.next(this.notifications);
  }

  list(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  unreadCount(): Observable<number> {
    return this.notificationsSubject.asObservable().pipe(
      map(notifications => notifications.filter(notification => !notification.read).length)
    );
  }

  markAsRead(index: number): void {
    if (this.notifications[index]) {
      this.notifications[index].read = true;
      this.notificationsSubject.next(this.notifications);
    }
  }
}

// Komponent licznika nieprzeczytanych powiadomień
class UnreadCountComponent {
  private unreadCount$: Observable<number>;

  constructor(private notificationService: NotificationService) {
    this.unreadCount$ = this.notificationService.unreadCount();
  }

  render(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      this.unreadCount$.subscribe(count => {
        element.textContent = `Unread notifications: ${count}`;
      });
    }
  }
}

// Komponent widoku wszystkich powiadomień
class NotificationListComponent {
  private notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.list();
  }

  render(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      this.notifications$.subscribe(notifications => {
        element.innerHTML = '';
        notifications.forEach((notification, index) => {
          const li = document.createElement('li');
          const cdiv = document.createElement('div');
          cdiv.classList.add('card', 'm-1');
          const cbdiv = document.createElement('div');
          cbdiv.classList.add('card-body');
          cbdiv.textContent = `${notification.date} - ${notification.title}: ${notification.message} (Priority: ${notification.priority})`;
          cbdiv.style.fontWeight = notification.read ? 'normal' : 'bold';
          cbdiv.onclick = () => this.notificationService.markAsRead(index);
          cdiv.appendChild(cbdiv);
          li.appendChild(cdiv);
          element.appendChild(li);
        });
      });
    }
  }
}

// Komponent okna dialogowego z powiadomieniami
class NotificationDialogComponent {
  private notifications$: Observable<Notification[]>;

  constructor(private notificationService: NotificationService) {
    this.notifications$ = this.notificationService.list();
  }

  render(): void {
    this.notifications$.subscribe(notifications => {
      const dialogNotification = notifications[notifications.length-1]
      if (dialogNotification.priority === 'medium' || dialogNotification.priority === 'high') {
        alert('You have new notifications:\n' + `${dialogNotification.title}: ${dialogNotification.message}`);
      }
    });
  }
}

// Inicjalizacja serwisu i komponentów
const notificationService = new NotificationService();

const unreadCountComponent = new UnreadCountComponent(notificationService);
const notificationListComponent = new NotificationListComponent(notificationService);
const notificationDialogComponent = new NotificationDialogComponent(notificationService);

// Podłączenie komponentów do elementów HTML
document.addEventListener('DOMContentLoaded', () => {
  unreadCountComponent.render('notification-count');
  notificationListComponent.render('notification-list');
  notificationDialogComponent.render();

  const notifyBtnLow = document.getElementById('notify_btn_low');
  if (notifyBtnLow) {
    notifyBtnLow.addEventListener('click', () => {
      notificationService.send({
        title: 'Low Msg',
        message: 'Not important.',
        date: new Date().toISOString(),
        priority: 'low',
        read: false
      });
    });
  }

  const notifyBtnMed = document.getElementById('notify_btn_med');
  if (notifyBtnMed) {
    notifyBtnMed.addEventListener('click', () => {
      notificationService.send({
        title: 'Med Msg',
        message: 'Somewhat important.',
        date: new Date().toISOString(),
        priority: 'medium',
        read: false
      });
    });
  }
});


