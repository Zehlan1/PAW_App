type ISOString = string
export interface Notification {
    title: string,
    message: string,
    date: ISOString,
    prority: 'low'|'medium'|'high',
    read: boolean
}