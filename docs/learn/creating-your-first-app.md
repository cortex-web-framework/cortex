# Creating Your First App

This guide will walk you through the process of creating a simple "Hello, World!" application with Cortex.

## 1.4. Creating Your First App

In the previous section, you created a new Cortex application and started the development server. Now, let's modify the app to display a "Hello, World!" message.

### Open the Project in Your Code Editor

Open the `my-app` directory in your favorite code editor. You will see a project structure that looks like this:

```
my-app/
├── node_modules/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   └── HelloWorld.jsx
│   ├── App.jsx
│   └── index.js
├── .gitignore
├── package.json
└── README.md
```

### The `App.jsx` File

The main component of your application is in `src/App.jsx`. Open this file and you will see something like this:

```jsx
import HelloWorld from './components/HelloWorld';

function App() {
  return (
    <div>
      <HelloWorld />
    </div>
  );
}

export default App;
```

This component is rendering the `HelloWorld` component.

### The `HelloWorld.jsx` File

Now, open `src/components/HelloWorld.jsx`. This is where the "Hello, World!" message is coming from.

```jsx
function HelloWorld() {
  return <h1>Hello, World!</h1>;
}

export default HelloWorld;
```

### Modify the Message

Let's change the message to something else. In `src/components/HelloWorld.jsx`, change the text inside the `<h1>` tag:

```jsx
function HelloWorld() {
  return <h1>Hello, Cortex!</h1>;
}

export default HelloWorld;
```

Save the file and go back to your browser. You should see the message change to "Hello, Cortex!".

Congratulations! You have just edited your first Cortex application.

## 1.5. Project Structure

Here is a brief overview of the default project structure of a Cortex application:

*   **`node_modules/`**: This directory contains all of your project's dependencies.
*   **`public/`**: This directory contains static assets that will be served directly by the web server. This is a good place for things like `favicon.ico`, `robots.txt`, and images.
*   **`src/`**: This is where your application's source code lives.
    *   **`components/`**: This directory is for your Cortex components.
    *   **`App.jsx`**: This is the root component of your application.
    *   **`index.js`**: This is the entry point of your application.
*   **`.gitignore`**: This file tells Git which files and directories to ignore.
*   **`package.json`**: This file contains information about your project and its dependencies.
*   **`README.md`**: This file contains information about your project.
