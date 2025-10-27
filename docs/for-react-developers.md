# Cortex for React Developers

## 1.1. Introduction

If you are a React developer, you will feel right at home with Cortex. Cortex was designed to be familiar to React developers, but it also has some key differences that make it more productive and easier to use.

This guide will help you get up to speed with Cortex and show you how to apply your existing React knowledge to Cortex development.

## 1.2. Core Concepts Mapping

| React Concept | Cortex Equivalent |
| :--- | :--- |
| Components | Components |
| JSX | Cortex uses a similar templating syntax, but with some Cortex-specific features. |
| State (useState, useReducer) | `useState` hook |
| Props | Props |
| Hooks | Cortex has its own set of hooks, including `useState` and `useData`. |
| Routing (React Router) | Built-in router |

## 1.3. Thinking in Cortex

While many of the core concepts of Cortex are similar to React, there are some key differences in the way you should think about building applications.

*   **Convention over Configuration:** Cortex favors convention over configuration. This means that there is often a "Cortex way" of doing things. This can take some getting used to, but it ultimately leads to a more productive and consistent development experience.
*   **Built-in Everything:** Cortex comes with a built-in router, data fetching library, and state management solution. This means that you don't have to spend time choosing and configuring third-party libraries.
*   **Simplicity:** Cortex is designed to be simple and easy to use. It has a smaller API surface than React, and it is easier to learn.

## 1.4. Migrating from React to Cortex

Migrating a React application to Cortex is a straightforward process. Here are the general steps:

1.  **Set up a new Cortex project:** Use the `create-cortex-app` command to create a new Cortex project.
2.  **Copy over your components:** Copy your React components into the `src/components` directory of your new Cortex project.
3.  **Update your components to use Cortex hooks:** Replace any React hooks (e.g., `useState`, `useEffect`) with their Cortex equivalents.
4.  **Update your routing:** Replace any React Router components with the Cortex router.
5.  **Update your data fetching:** Replace any data fetching code with the Cortex `useData` hook.
