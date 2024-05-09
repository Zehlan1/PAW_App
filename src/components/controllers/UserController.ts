import { User } from "../models/User";
import { ProjectController } from "./ProjectController";

export class UserController {
  static projectController = new ProjectController();

  static users: User[] = [
    { id: "1", firstName: "Tom", lastName: "Scott", role: "Admin" },
    { id: "2", firstName: "Sylvester", lastName: "Stalonne", role: "Developer" },
    { id: "3", firstName: "Bob", lastName: "Marley", role: "DevOps" }
  ];

  static getLoggedInUser(): User {
    return this.users.find((user) => user.role === "Admin") as User;
  }

  static getUsers(): User[] {
    return this.users;
  }

  static async loginUser(event: Event) {
    event.preventDefault();
    const username = (document.getElementById('user_login') as HTMLInputElement).value;
    const password = (document.getElementById('user_password') as HTMLInputElement).value;


    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      alert('Failed to login');
      throw new Error('Failed to login');
    }

    const data = await response.json();

    console.log('Login successful:', data);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('refreshToken', data.refreshToken);
    sessionStorage.setItem('userData', JSON.stringify({ username}));

    this.toggleLoginFormVisibility(false);
    this.toggleProjectVisibility(true);
    this.updateUsernameDisplay();
  }

  static toggleLoginFormVisibility(show: boolean) {
    const loginSection = document.getElementById("login_box");
    if (loginSection == null) return;
    loginSection.style.display = show ? "block" : "none";
  }

  static toggleProjectVisibility(show: boolean) {
    const projectSection = document.getElementById("project-section");
    if (projectSection == null) return;
    projectSection.style.display = show ? "block" : "none";
    this.projectController.renderProjects();
  }

  static updateUsernameDisplay() {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        const usernameDisplay = document.getElementById('username_box');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.username; 
        }
    }
  }

  static async loginUserGoogle(event: Event){
    event.preventDefault();
    const response = await fetch('http://localhost:3000/auth/google', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to login');
    }

    const data = await response.json();
    console.log('Login successful:', data);
  }
}