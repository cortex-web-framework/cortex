# Core Concepts

This section provides a deep dive into the core concepts of Cortex.

## 2.1. Components

Components are the building blocks of a Cortex application. A component is a self-contained, reusable piece of UI. Cortex components are written in JSX, a syntax extension for JavaScript that allows you to write HTML-like code in your JavaScript files.

### Creating a Component

Here is an example of a simple Cortex component:

```jsx
function Greeting() {
  return <h1>Hello, Cortex!</h1>;
}

export default Greeting;
```

This component is a JavaScript function that returns a JSX element. The `export default` statement makes the component available for use in other parts of your application.

### Using a Component

To use a component, you first need to import it into the file where you want to use it. Then, you can use it in your JSX just like you would use a regular HTML tag.

```jsx
import Greeting from './Greeting';

function App() {
  return (
    <div>
      <Greeting />
    </div>
  );
}

export default App;
```

### Props

Components can accept data from their parent component through a mechanism called "props". Props are passed to a component as attributes in the JSX.

Here is an example of a component that accepts a `name` prop:

```jsx
function Greeting(props) {
  return <h1>Hello, {props.name}!</h1>;
}

export default Greeting;
```

And here is how you would pass the `name` prop to the `Greeting` component:

```jsx
import Greeting from './Greeting';

function App() {
  return (
    <div>
      <Greeting name="Cortex" />
    </div>
  );
}

export default App;
```

This would render an `<h1>` tag with the text "Hello, Cortex!".

## 2.2. State Management

State is the data that your application needs to keep track of. In Cortex, state is managed using a simple and powerful system that is built into the framework.

### Declaring State

To declare a piece of state in a Cortex component, you can use the `useState` hook. The `useState` hook returns an array with two elements: the current value of the state and a function to update it.

Here is an example of a component that uses the `useState` hook to manage a `count` state:

```jsx
import { useState } from 'cortex';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default Counter;
```

### Updating State

To update a piece of state, you can call the update function that is returned by the `useState` hook. In the example above, the `setCount` function is used to update the `count` state.

When you call the update function, Cortex will re-render the component with the new state value.

### Sharing State

Cortex also provides a way to share state between components. This is done using a mechanism called "stores". A store is a global container for state that can be accessed from any component in your application.

To learn more about stores, see the "Stores" section of the documentation.

## 2.3. Routing

Routing is the process of navigating between different pages in a web application. Cortex has a built-in router that makes it easy to handle routing and navigation.

### Defining Routes

Routes are defined in a central location in your application. Each route is mapped to a specific component.

Here is an example of how to define routes in a Cortex application:

```jsx
import { Router, Route } from 'cortex/router';
import Home from './pages/Home';
import About from './pages/About';

function App() {
  return (
    <Router>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
    </Router>
  );
}

export default App;
```

### Navigating Between Pages

To navigate between pages, you can use the `Link` component. The `Link` component is similar to a regular `<a>` tag, but it uses the Cortex router to navigate without a full page reload.

Here is an example of how to use the `Link` component:

```jsx
import { Link } from 'cortex/router';

function Navigation() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
    </nav>
  );
}

export default Navigation;
```

## 2.4. Data Fetching

Cortex provides a simple way to fetch data from an API. You can use the `useData` hook to fetch data and manage the loading and error states.

### Fetching Data

Here is an example of a component that fetches a list of users from an API:

```jsx
import { useData } from 'cortex';

function UserList() {
  const { data, loading, error } = useData('/api/users');

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <ul>
      {data.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default UserList;
```

### Posting Data

The `useData` hook also provides a `post` function that you can use to send data to an API.

To learn more about data fetching, see the "Data Fetching" section of the documentation.

## 2.5. Styling

Cortex components can be styled using plain CSS, CSS-in-JS libraries, or CSS frameworks like Tailwind CSS.

### Plain CSS

To style a component with plain CSS, you can create a CSS file and import it into your component.

```css
/* styles.css */
.greeting {
  color: blue;
}
```

```jsx
import './styles.css';

function Greeting() {
  return <h1 className="greeting">Hello, Cortex!</h1>;
}

export default Greeting;
```

### CSS-in-JS

You can also use a CSS-in-JS library like `styled-components` or `emotion` to style your components.

To learn more about styling, see the "Styling" section of the documentation.
