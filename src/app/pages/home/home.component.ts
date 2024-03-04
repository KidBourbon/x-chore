import {
  Component,
  Injector,
  computed,
  effect,
  inject,
  signal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormControl, ReactiveFormsModule, Validators } from "@angular/forms";

import { Task } from "../../models/task.model";

type TaskFilter = "all" | "completed" | "pending";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  private injector = inject(Injector);

  id = signal(this.getStoredId());
  tasks = signal<Task[]>(this.getStoredTasks());
  filter = signal<TaskFilter>("all");

  tasksByFilter = computed(() => {
    const filter = this.filter();
    const tasks = this.tasks();

    if (filter === "pending") {
      return tasks.filter((task) => !task.completed);
    } else if (filter === "completed") {
      return tasks.filter((task) => task.completed);
    } else {
      return tasks;
    }
  });

  newTaskCtrl = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required],
  });

  editTaskCtrl = new FormControl("", {
    nonNullable: true,
    validators: [Validators.required],
  });

  ngOnInit() {
    this.trackTasks();
    this.trackId();
  }

  *idGenerator(): Generator<number> {
    while (true) {
      this.id.set(this.id() + 1);
      yield this.id();
    }
  }

  private getStoredId(): number {
    let id = 0;
    const storage = localStorage.getItem("id");

    if (storage) {
      id = JSON.parse(storage);
    }

    return id;
  }

  trackId() {
    effect(
      () => {
        const id = this.id();
        localStorage.setItem("id", JSON.stringify(id));
      },
      { injector: this.injector }
    );
  }

  private getStoredTasks(): Task[] {
    let tasks: Task[] = [];
    const storage = localStorage.getItem("tasks");

    if (storage) {
      tasks = JSON.parse(storage);
    }

    return tasks;
  }

  trackTasks() {
    effect(
      () => {
        const tasks = this.tasks();
        localStorage.setItem("tasks", JSON.stringify(tasks));
      },
      { injector: this.injector }
    );
  }

  createTask() {
    const isTaskTitleValid = this.validateTaskTitle(this.newTaskCtrl);

    if (isTaskTitleValid) {
      const title = this.newTaskCtrl.value;
      this.addTask(title);
      this.newTaskCtrl.setValue("");
    }
  }

  private addTask(title: string) {
    const id = this.idGenerator().next().value;

    const newTask = {
      id,
      title,
      completed: false,
    };

    this.tasks.update((tasks) => [...tasks, newTask]);
  }

  updateTaskCompletion(id: number) {
    this.tasks.update((tasks) => {
      return tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            completed: !task.completed,
          };
        }
        return task;
      });
    });
  }

  updateTaskEditingMode(id: number) {
    this.setEditTaskCtrlValue(id);

    this.tasks.update((tasks) => {
      return tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            editing: true,
          };
        }
        return {
          ...task,
          editing: false,
        };
      });
    });
  }

  private setEditTaskCtrlValue(id: number) {
    const task = this.getTaskById(id);

    if (task) {
      this.editTaskCtrl.setValue(task.title);
    }
  }

  private getTaskById(id: number): Task | undefined {
    return this.tasks().find((task) => task.id === id);
  }

  updateTaskTitle(id: number) {
    const isTaskTitleValid = this.validateTaskTitle(this.editTaskCtrl);

    if (isTaskTitleValid) {
      const newTitle = this.editTaskCtrl.value;
      this.editTaskTitle(id, newTitle);
    }
  }

  private editTaskTitle(id: number, newTitle: string) {
    this.tasks.update((tasks) => {
      return tasks.map((task) => {
        if (task.id === id) {
          return {
            ...task,
            title: newTitle,
            editing: false,
          };
        }
        return task;
      });
    });
  }

  deleteTask(id: number) {
    this.tasks.update((tasks) => tasks.filter((task) => task.id !== id));
  }

  clearCompletedTasks() {
    this.tasks.update((tasks) => tasks.filter((task) => !task.completed));
  }

  validateTaskTitle(formCtrl: FormControl<string>) {
    return formCtrl.valid && formCtrl.value.trim() !== "";
  }

  setFilter(filter: TaskFilter) {
    this.filter.set(filter);
  }
}
