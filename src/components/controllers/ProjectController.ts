import { Project } from "../models/Project";
import { StoryController } from "./StoryController";

import { initializeApp } from "firebase/app";
import { deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc } from "firebase/firestore";
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

export class ProjectController {
    private storyController = new StoryController();
  
    constructor() {
      this.attachEventListeners();
    }
  
    public async renderProjects() {
      const projects = await getDocs(collection(db, "projects"));
      const projectsList = document.getElementById("projects-list");
  
      if (projectsList) {
        projectsList.innerHTML = "";
  
        projects.forEach((project) => {
          const wrapper = document.createElement("div");
          wrapper.classList.add("card", "mb-2")

          const buttonBox = document.createElement("div");
          buttonBox.classList.add("d-flex", "flex-row", "gap-1");

          const projectElement = document.createElement("div");
          projectElement.classList.add("card-body");
          projectElement.innerHTML = `
            <h3>${project.data().name}</h3>
            <p class="text-muted">${project.data().description}</p>
          `;

          const selectButton = document.createElement("button");
          selectButton.textContent = "Select";
          selectButton.classList.add("btn", "btn-success");
          selectButton.onclick = () => this.setActiveProject(project.id);

          const editButton = document.createElement("button");
          editButton.textContent = "Edit";
          editButton.classList.add("btn", "btn-warning");
          editButton.onclick = () => this.editProject(project.id);
  
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Delete";
          deleteButton.classList.add("btn", "btn-danger");
          deleteButton.onclick = () => this.deleteProject(project.id);
  
          buttonBox.appendChild(selectButton);
          buttonBox.appendChild(editButton);
          buttonBox.appendChild(deleteButton);
          projectElement.appendChild(buttonBox);
  
          wrapper.appendChild(projectElement);
          projectsList.appendChild(wrapper);
        });
      }
    }
  
    public async saveProject(event: Event) {
      event.preventDefault();
  
      const idInput = document.getElementById("project-id") as HTMLInputElement;
      const nameInput = document.getElementById("project-name") as HTMLInputElement;
      const descriptionInput = document.getElementById("project-description") as HTMLTextAreaElement;
  
      const project: Project = {
        name: nameInput.value,
        description: descriptionInput.value,
      };

      if(!idInput.value) {
        try {
          await addDoc(collection(db, "projects"), project);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      } else {
        const docRef = doc(db, 'projects', idInput.value);
        await setDoc(docRef, project);
      }

      this.clearForm();
      this.renderProjects();
    }
  
    public async editProject(id: string) {
      const docRef = doc(db, "projects", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.clearForm();
        const idInput = document.getElementById("project-id") as HTMLInputElement;
        const nameInput = document.getElementById("project-name") as HTMLInputElement;
        const descriptionInput = document.getElementById("project-description") as HTMLTextAreaElement;

        idInput.value = docSnap.id;
        nameInput.value = docSnap.data().name;
        descriptionInput.value = docSnap.data().description;
      } else {
        console.log("No project!");
      }
    }
  
    public async deleteProject(id: string) {
      await deleteDoc(doc(db, "projects", id));
      this.renderProjects();
    }
  
    private clearForm() {
      const idInput = document.getElementById("project-id") as HTMLInputElement;
      const nameInput = document.getElementById("project-name") as HTMLInputElement;
      const descriptionInput = document.getElementById("project-description") as HTMLTextAreaElement;
  
      idInput.value = "";
      nameInput.value = "";
      descriptionInput.value = "";
    }
  
    private attachEventListeners() {
      const projectForm = document.getElementById("project-form");
      if (projectForm) {
        projectForm.addEventListener("submit", (event) =>
          this.saveProject(event)
        );
      }
    }
  
    public async setActiveProject(id: string): Promise<void> {
      this.storyController.setProject(id);
      await this.storyController.renderStories();
      this.toggleProjectVisibility(false);
      this.toggleStoryVisibility(true);
    }
  
    public toggleProjectVisibility(show: boolean) {
      const projectSection = document.getElementById("project-section");
      if (projectSection == null) return;
      projectSection.style.display = show ? "block" : "none";
    }
  
    public toggleStoryVisibility(show: boolean) {
      const storySection = document.getElementById("story-section");
      if (storySection == null) return;
      storySection.style.display = show ? "block" : "none";
    }
  }