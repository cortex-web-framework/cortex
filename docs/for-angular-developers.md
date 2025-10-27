# Cortex for Angular Developers

## 3.1. Introduction

If you are an Angular developer, you will appreciate Cortex's focus on structure and convention. However, Cortex is a much simpler and more lightweight framework than Angular.

This guide will help you get up to speed with Cortex and show you how to apply your existing Angular knowledge to Cortex development.

## 3.2. Core Concepts Mapping

| Angular Concept | Cortex Equivalent |
| :--- | :--- |
| Modules | Cortex does not have modules in the same way as Angular. Code is organized into files and directories. |
| Components | Components |
| Templates | Cortex uses a JSX-based templating syntax. |
| Dependency Injection | Cortex does not have a dependency injection system. Dependencies are imported and used directly. |
| Services | Services can be implemented as plain JavaScript modules. |
| Routing (Angular Router) | Built-in router |

## 3.3. Thinking in Cortex

While many of the core concepts of Cortex are similar to Angular, there are some key differences in the way you should think about building applications.

*   **Simplicity over Features:** Cortex prioritizes simplicity and ease of use over having a large number of features. This means that you may have to write more code to accomplish some tasks, but the overall development experience is simpler and more enjoyable.
*   **Functional over Object-Oriented:** Cortex is a functional framework, while Angular is an object-oriented framework. This means that you will be working with functions and components instead of classes and services.
*   **No Dependency Injection:** Cortex does not have a dependency injection system. Dependencies are imported and used directly. This makes the code easier to reason about, but it also means that you have to manage your own dependencies.

## 3.4. Migrating from Angular to Cortex

Migrating an Angular application to Cortex is a significant undertaking. Here are the general steps:

1.  **Set up a new Cortex project:** Use the `create-cortex-app` command to create a new Cortex project.
2.  **Rewrite your components in JSX:** Rewrite your Angular components in JSX. This will be the most time-consuming part of the migration.
3.  **Rewrite your services as plain JavaScript modules:** Rewrite your Angular services as plain JavaScript modules.
4.  **Update your routing:** Replace any Angular Router components with the Cortex router.
