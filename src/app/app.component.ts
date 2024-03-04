import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";


@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "todo-app";
  welcome = "Welcome to my first app with Angular!";
  tasks = [
    "Install Angular CLI",
    "Create project",
    "Create component",
    "Create service",
  ];
}
