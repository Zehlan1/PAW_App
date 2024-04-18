import { User } from "../models/User";

export class UserController {
  private static users: User[] = [
    { id: "1", firstName: "John", lastName: "Deere", role: "Admin" },
    { id: "2", firstName: "Robert", lastName: "House", role: "Developer" },
    { id: "3", firstName: "Max", lastName: "Payne", role: "DevOps" },
  ];

  static getLoggedInUser(): User {
    return this.users.find((user) => user.role === "Admin") as User;
  }

  static getUsers(): User[] {
    return this.users;
  }
}