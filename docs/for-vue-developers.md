# Cortex for Vue Developers

## 2.1. Introduction

If you are a Vue developer, you will find that Cortex has a similar focus on developer experience and ease of use. However, there are some key differences that you should be aware of.

This guide will help you get up to speed with Cortex and show you how to apply your existing Vue knowledge to Cortex development.

## 2.2. Core Concepts Mapping

| Vue Concept | Cortex Equivalent |
| :--- | :--- |
| Components | Components |
| Templates | Cortex uses a JSX-based templating syntax. |
| Options API / Composition API | Cortex components are simple functions. |
| State (Pinia, Vuex) | Built-in state management with `useState` and stores. |
| Props | Props |
| Routing (Vue Router) | Built-in router |

## 2.3. Thinking in Cortex

While many of the core concepts of Cortex are similar to Vue, there are some key differences in the way you should think about building applications.

*   **Convention over Configuration:** Cortex favors convention over configuration. This means that there is often a "Cortex way" of doing things. This can take some getting used to, but it ultimately leads to a more productive and consistent development experience.
*   **Built-in Everything:** Cortex comes with a built-in router, data fetching library, and state management solution. This means that you don't have to spend time choosing and configuring third-party libraries.
*   **Simplicity:** Cortex is designed to be simple and easy to use. It has a smaller API surface than Vue, and it is easier to learn.

## 2.4. Migrating from Vue to Cortex

Migrating a Vue application to Cortex is a straightforward process. Here are the general steps:

1.  **Set up a new Cortex project:** Use the `create-cortex-app` command to create a new Cortex project.
2.  **Copy over your components:** Copy your Vue components into the `src/components` directory of your new Cortex project.
3.  **Convert your templates to JSX:** Convert your Vue templates to JSX. This will likely be the most time-consuming part of the migration.
4.  **Update your components to use Cortex hooks:** Replace any Vue APIs (e.g., `data`, `methods`, `computed`) with their Cortex equivalents.
5.  **Update your routing:** Replace any Vue Router components with the Cortex router.
