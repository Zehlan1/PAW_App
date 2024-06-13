import { UserController } from './components/controllers/UserController';
import { ProjectController } from './components/controllers/ProjectController';
document.addEventListener('DOMContentLoaded', () => {

  UserController.handleGoogleLoginRedirection();
  
  const projectController = new ProjectController();
  projectController.renderProjects();

  const loginForm = document.getElementById('login_form') as HTMLFormElement;
  loginForm.addEventListener('submit', (event) => UserController.loginUser(event));

  const googleLoginButton = document.getElementById('google_login_btn') as HTMLButtonElement;
  googleLoginButton.addEventListener('click', (event) => UserController.loginUserGoogle(event));

  
});


