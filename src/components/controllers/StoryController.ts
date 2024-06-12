import { Story } from "../models/Story";
import { UserController } from "./UserController";
import { TaskController } from "./TaskController";

import { initializeApp } from "firebase/app";
import { deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, where } from "firebase/firestore";
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

export class StoryController {
  private taskController = new TaskController();
  private projectId = localStorage.getItem('activeProjectId');

  constructor() {
    this.attachEventListeners();
    this.attachFilterChangeListener();
  }

  public async renderStories() {
    const q = query(collection(db, "stories"), where("projectId", "==", this.projectId));
    const querySnapshot = await getDocs(q);
  
    // Story filter
    const filter = (document.getElementById("story-filter") as HTMLSelectElement)?.value;
  
    let filteredData;
    if (filter) {
      const filteredDocs = querySnapshot.docs.filter(doc => doc.data().state === filter);
      filteredData = filteredDocs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      filteredData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  
    this.buildStories(filteredData);
  }
  

  public buildStories(filteredData: any[]) {
    const storiesList = document.getElementById("stories-list");
    if (storiesList) {
      storiesList.innerHTML = "";
      filteredData.forEach((story) => {
        const storyElement = document.createElement("div");
        storyElement.classList.add("container", "mx-auto", "mb-2", "bg-secondary");
        storyElement.innerHTML = `
          <h4>${story.name}</h4>
          <p class="text-muted">${story.description}</p>
          <p>Priority: ${story.priority}</p>
          <p>Status: ${story.state}</p>
          <p>Created: ${story.creationDate}</p>
        `;
  
        const selectButton = document.createElement("button");
        selectButton.textContent = "Select";
        selectButton.classList.add("btn", "btn-success");
        selectButton.onclick = () => this.setActiveStory(story.id);
  
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.classList.add("btn", "btn-warning");
        editButton.onclick = () => this.editStory(story.id);
  
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.onclick = () => this.deleteStory(story.id);
  
        storyElement.appendChild(selectButton);
        storyElement.appendChild(editButton);
        storyElement.appendChild(deleteButton);
        
        storiesList.appendChild(storyElement);
      });
    }
  }
  

  public async saveStory(event: Event) {
    event.preventDefault();
    const idInput = document.getElementById("story-id") as HTMLInputElement;
    const nameInput = document.getElementById("story-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("story-description") as HTMLTextAreaElement;
    const prioritySelect = document.getElementById("story-priority") as HTMLSelectElement;
    const statusSelect = document.getElementById("story-status") as HTMLSelectElement;
    const projectId = this.projectId || "";

    const story: Story = {
      name: nameInput.value,
      description: descriptionInput.value,
      priority: prioritySelect.value as "Low" | "Medium" | "High",
      projectId: projectId,
      creationDate: new Date(),
      state: statusSelect.value as "Todo" | "Doing" | "Done",
      ownerId: this.getCurrentUser().id,
    };

    if(!idInput.value) {
      try {
        await addDoc(collection(db, "stories"), story);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      const docRef = doc(db, 'stories', idInput.value);
      await setDoc(docRef, story);
    }

    this.clearForm();
    this.renderStories();
  }

  public async editStory(id: string) {
    const docRef = doc(db, "stories", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.clearForm();
      const idInput = document.getElementById("story-id") as HTMLInputElement;
      const nameInput = document.getElementById("story-name") as HTMLInputElement;
      const descriptionInput = document.getElementById("story-description") as HTMLTextAreaElement;
      const prioritySelect = document.getElementById("story-priority") as HTMLSelectElement;
      const statusSelect = document.getElementById("story-status") as HTMLSelectElement;

      idInput.value = docSnap.id;
      nameInput.value = docSnap.data().name;
      descriptionInput.value = docSnap.data().description;
      prioritySelect.value = docSnap.data().priority;
      statusSelect.value = docSnap.data().state;
    } else {
      console.log("No story!");
    }
  }

  public async deleteStory(id: string) {
    await deleteDoc(doc(db, "stories", id));
    this.renderStories();
  }

  private clearForm() {
    const idInput = document.getElementById("story-id") as HTMLInputElement;
    const nameInput = document.getElementById("story-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("story-description") as HTMLTextAreaElement;
    const prioritySelect = document.getElementById("story-priority") as HTMLSelectElement;
    const statusSelect = document.getElementById("story-status") as HTMLSelectElement;

    idInput.value = "";
    nameInput.value = "";
    descriptionInput.value = "";
    prioritySelect.value = "Low";
    statusSelect.value = "Todo";
  }

  private attachEventListeners() {
    const storyForm = document.getElementById("story-form");
    if (storyForm) {
      storyForm.addEventListener("submit", (event) => this.saveStory(event));
    }
  }

  private attachFilterChangeListener() {
    const filterDropdown = document.getElementById("story-filter") as HTMLSelectElement;
    filterDropdown.addEventListener("change", () => {
      this.renderStories();
    });
  }

  private getCurrentUser() {
    return UserController.getLoggedInUser();
  }

  public setActiveStory(storyId: string): void {
    localStorage.setItem('activeStoryId', storyId);
    this.toggleStoryVisibility(false);
    this.taskController.renderTasks();
    this.toggleTaskVisibility(true); 
    
  }

  public toggleStoryVisibility(show: boolean) {
    const storySection = document.getElementById("story-section");
    if (storySection == null) return;
    storySection.style.display = show ? "block" : "none";
  }

  public toggleTaskVisibility(show: boolean) {
    const taskSection = document.getElementById("task-section");
    if (taskSection == null) return;
    taskSection.style.display = show ? "block" : "none";
  }

}