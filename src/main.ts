import { UserController } from './components/controllers/UserController';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login_form') as HTMLFormElement;
  loginForm.addEventListener('submit', (event) => UserController.loginUser(event));

  const googleLoginButton = document.getElementById('google-login-button') as HTMLButtonElement;
  googleLoginButton.addEventListener('click', (event) => UserController.loginUserGoogle(event));
});
