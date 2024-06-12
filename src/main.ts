import { UserController } from './components/controllers/UserController';
import { ProjectController } from './components/controllers/ProjectController';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, addDoc } from "firebase/firestore"; 

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: "AIzaSyCG8TnV2eLqRwp3WsTMdKFHP8TJTA62b20",
  authDomain: "paw-app-e2f08.firebaseapp.com",
  projectId: "paw-app-e2f08",
  storageBucket: "paw-app-e2f08.appspot.com",
  messagingSenderId: "794662808966",
  appId: "1:794662808966:web:b9a58d41bd43810d0a9007",
  measurementId: "G-3DDPF9BGC4"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// try {
//   const docRef = await addDoc(collection(db, "users"), {
//     first: "Ada",
//     last: "Lovelace",
//     born: 1815
//   });
//   console.log("Document written with ID: ", docRef.id);
// } catch (e) {
//   console.error("Error adding document: ", e);
// }


document.addEventListener('DOMContentLoaded', () => {

  const projectController = new ProjectController();
  projectController.renderProjects();

  const loginForm = document.getElementById('login_form') as HTMLFormElement;
  loginForm.addEventListener('submit', (event) => UserController.loginUser(event));

  // const googleLoginButton = document.getElementById('google-login-button') as HTMLButtonElement;
  // googleLoginButton.addEventListener('click', (event) => UserController.loginUserGoogle(event));
});
