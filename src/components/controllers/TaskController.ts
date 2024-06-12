import { v4 as uuidv4 } from "uuid";
import { Task } from "../models/Task";
import { UserController } from "./UserController";
import { ApiService } from "../api_mock/ApiService";

import { initializeApp } from "firebase/app";
import { deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from "firebase/firestore";
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

export class TaskController {
  private storyId = localStorage.getItem('activeStoryId');

  constructor() {
    this.attachEventListeners();
  }

  public async renderTasks() {
    const q = query(collection(db, "tasks"), where("storyId", "==", this.storyId));
    const querySnapshot = await getDocs(q);

    const todoList = document.getElementById("tasks-todo")?.querySelector(".tasks-list");
    const doingList = document.getElementById("tasks-doing")?.querySelector(".tasks-list");
    const doneList = document.getElementById("tasks-done")?.querySelector(".tasks-list");

    if (todoList) {
      todoList.innerHTML = "";
    }
    if (doingList) {
      doingList.innerHTML = "";
    }
    if (doneList) {
      doneList.innerHTML = "";
    }

    querySnapshot.forEach((task) => {
      const taskElement = document.createElement("div");
      taskElement.className = "task-card";
      taskElement.classList.add("container", "mx-auto", "mb-2", "bg-primary");
      taskElement.innerHTML = `
        <h4>${task.data().name}</h4>
        <p class="text-muted">${task.data().description}</p>
        <p>Priority: ${task.data().priority}</p>
      `;

      const editButton = document.createElement("button");
      editButton.textContent = "Edit";
      editButton.classList.add("btn", "btn-warning");
      editButton.onclick = () => this.editTask(task.id);

      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.classList.add("btn", "btn-danger");
      deleteButton.onclick = () => this.deleteTask(task.id);

      const detailsButton = document.createElement("button");
      detailsButton.textContent = "See details";
      detailsButton.classList.add("btn", "btn-info");
      detailsButton.onclick = () => this.showTaskDetails(task.id);

      taskElement.appendChild(editButton);
      taskElement.appendChild(deleteButton);
      taskElement.appendChild(detailsButton);

      // Append to the correct column based on task status
      if (task.data().state === "Todo" && todoList) {
        todoList.appendChild(taskElement);
      } else if (task.data().state === "Doing" && doingList) {
        doingList.appendChild(taskElement);
      } else if (task.data().state === "Done" && doneList) {
        doneList.appendChild(taskElement);
      }
    });
  }

  public async saveTask(event: Event) {
    event.preventDefault();
    const idInput = document.getElementById("task-id") as HTMLInputElement;
    const nameInput = document.getElementById("task-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("task-description") as HTMLTextAreaElement;
    const prioritySelect = document.getElementById("task-priority") as HTMLSelectElement;
    const statusSelect = document.getElementById("task-status") as HTMLSelectElement;
    const estimatedTimeInput = document.getElementById("task-estimated-time") as HTMLSelectElement;
    const storyId = this.storyId || "";

    const task: Task = {
      name: nameInput.value,
      description: descriptionInput.value,
      priority: prioritySelect.value as "Low" | "Medium" | "High",
      storyId: storyId,
      estimatedTime: estimatedTimeInput.value,
      state: statusSelect.value as "Todo" | "Doing" | "Done",
      creationDate: new Date(),
    };

    if(!idInput.value) {
      try {
        await addDoc(collection(db, "tasks"), task);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    } else {
      const docRef = doc(db, 'tasks', idInput.value);
      await setDoc(docRef, task);
    }

    this.clearForm();
    this.renderTasks();
  }

  public async editTask(id: string) {
    const docRef = doc(db, "tasks", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.clearForm();
      const idInput = document.getElementById("task-id") as HTMLInputElement;
      const nameInput = document.getElementById("task-name") as HTMLInputElement;
      const descriptionInput = document.getElementById("task-description") as HTMLTextAreaElement;
      const prioritySelect = document.getElementById("task-priority") as HTMLSelectElement;
      const statusSelect = document.getElementById("task-status") as HTMLSelectElement;
      const estimatedTimeInput = document.getElementById("task-estimated-time") as HTMLSelectElement;

      idInput.value = docSnap.id;
      nameInput.value = docSnap.data().name;
      descriptionInput.value = docSnap.data().description;
      prioritySelect.value = docSnap.data().priority;
      statusSelect.value = docSnap.data().state;
      estimatedTimeInput.value = docSnap.data().estimatedTime;
    }
  }

  public async deleteTask(id: string) {
    await deleteDoc(doc(db, "tasks", id));
    this.renderTasks();
  }

  public async showTaskDetails(taskId: string) {
    const docRef = doc(db, "tasks", taskId);
    const docSnap = await getDoc(docRef);

    const detailsContainer = document.getElementById("task-details-container");
    if (!detailsContainer) return;

    if (docSnap.exists()) {
      detailsContainer.innerHTML = `
        <h2>Task Details: ${docSnap.data().name}</h2>
        <p>Description: ${docSnap.data().description}</p>
        <p>Priority: ${docSnap.data().priority}</p>
        <p>Status: ${docSnap.data().state}</p>
        <p>Estimated Time: ${docSnap.data().estimatedTime} hours</p>
        <p>Assigned to: ${docSnap.data().userId || "None"}</p>
        <p>Start date: ${docSnap.data().startDate || "None"}</p>
        <p>End date: ${docSnap.data().endDate || "None"}</p>
      `;

      if (docSnap.data().state == "Todo") {
        const selectElement = document.createElement("select");
        selectElement.id = "user-select";
        selectElement.classList.add("form-select")
        const optionElement = document.createElement("option");
        optionElement.value = "";
        optionElement.textContent = "Select a user";
        selectElement.appendChild(optionElement);
        detailsContainer.appendChild(selectElement);
  
        const assignUserButton = document.createElement("button");
        assignUserButton.textContent = "Assign User";
        assignUserButton.classList.add("btn", "btn-primary");
        assignUserButton.onclick = () => this.assignUser(docSnap.id);
  
        detailsContainer.appendChild(assignUserButton);
      }
      const changeStateButton = document.createElement("button");
      changeStateButton.textContent = "Mark as done";
      changeStateButton.classList.add("btn", "btn-success");
      changeStateButton.onclick = () => this.changeTaskState(docSnap.id);
  
      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.classList.add("btn", "btn-danger");
      closeButton.onclick = () => this.changeTaskDetailsVisibility();
  
      
      detailsContainer.appendChild(changeStateButton);
      detailsContainer.appendChild(closeButton);
  
      this.populateUserDropdown();
      this.changeTaskDetailsVisibility();
    }
  }

  public async assignUser(taskId: string) {
    const docRef = doc(db, "tasks", taskId);
    const userSelect = document.getElementById("user-select") as HTMLSelectElement;

    if(userSelect) {
      await updateDoc(docRef, {
        userId: userSelect.value,
        state: "Doing",
        startDate: new Date(),
      });
      this.renderTasks();
      this.changeTaskDetailsVisibility();
    }
  }

  public async changeTaskState(taskId: string) {
    const docRef = doc(db, "tasks", taskId);
    await updateDoc(docRef, {
      state: "Done",
      endDate: new Date(),
    });
    this.renderTasks();
    this.changeTaskDetailsVisibility();
  }

  private changeTaskDetailsVisibility() {
    const detailsContainer = document.getElementById("task-details-container");
    if (detailsContainer) {
      if (detailsContainer.style.display == "block") {
        detailsContainer.style.display = "none";
      } else {
        detailsContainer.style.display = "block";
      }
    }
  }

  public populateUserDropdown() {
    const userSelect = document.getElementById("user-select");
    if (!userSelect) return;

    const users = UserController.getUsers();
    users.forEach((user) => {
      if (user.role != "Admin") {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = `${user.firstName} ${user.lastName} (${user.role})`;
        userSelect.appendChild(option);
      }
    });
  }

  private attachEventListeners() {
    const taskForm = document.getElementById("task-form");
    if (taskForm) {
      taskForm.addEventListener("submit", (event) => this.saveTask(event));
    }
  }

  private clearForm() {
    const idInput = document.getElementById("task-id") as HTMLInputElement;
    const nameInput = document.getElementById("task-name") as HTMLInputElement;
    const descriptionInput = document.getElementById("task-description") as HTMLTextAreaElement;
    const prioritySelect = document.getElementById("task-priority") as HTMLSelectElement;
    const statusSelect = document.getElementById("task-status") as HTMLSelectElement;
    const estimatedTimeInput = document.getElementById("task-estimated-time") as HTMLSelectElement;

    idInput.value = "";
    nameInput.value = "";
    descriptionInput.value = "";
    prioritySelect.value = "Low";
    statusSelect.value = "Todo";
    estimatedTimeInput.value = "";
  }
}