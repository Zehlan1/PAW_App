import { User } from "../models/User";

export class UserController {

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
    
    this.toggleLoginBtns();
    this.updateUsernameDisplay();
  }

  static toggleLoginFormVisibility(show: boolean) {
    const loginSection = document.getElementById("login_box");
    if (loginSection == null) return;
    loginSection.style.display = show ? "block" : "none";
  }

  static toggleLoginBtns() {
    const loginBtn = document.getElementById("login_btn");
    const googleLoginBtn = document.getElementById("google_login_btn");
    if (loginBtn != null && googleLoginBtn != null) {
      loginBtn.style.display = "none";
      googleLoginBtn.style.display = "none";
    }
  }

  static updateUsernameDisplay() {
    const userData = sessionStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        const usernameDisplay = document.getElementById('username_box');
        if (usernameDisplay) {
            usernameDisplay.textContent = user.username; 
            usernameDisplay.style.display = "block";
        }
    }
  }

  static async loginUserGoogle(event: Event){
    event.preventDefault();
    window.location.href = 'http://localhost:3000/auth/google';
  }
  
  static getQueryParams() {
    const params: { [key: string]: string } = {};
    window.location.search.substr(1).split('&').forEach(function(item) {
      const s = item.split('=');
      params[s[0]] = s[1];
    });
    return params;
  }
  
  static handleGoogleLoginRedirection() {
    const params = this.getQueryParams();
    const token = params['token'];
    const refreshToken = params['refreshToken'];
    const username = params['username'];
  
    if (token && refreshToken && username) {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('userData', JSON.stringify({ username }));
      
      this.toggleLoginBtns();
      this.updateUsernameDisplay();
      
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}