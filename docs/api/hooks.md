# Hooks

This section provides a reference for all the built-in hooks that come with Cortex.

## `useState`

The `useState` hook allows you to add state to a component.

### Usage

```jsx
const [state, setState] = useState(initialState);
```

### Parameters

*   `initialState`: The initial value of the state. This can be a value of any type, or a function that returns the initial value.

### Returns

An array with two elements:

1.  `state`: The current value of the state.
2.  `setState`: A function that you can use to update the state.

### Example

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

## `useData`

The `useData` hook allows you to fetch data from an API.

### Usage

```jsx
const { data, loading, error, post } = useData(url, options);
```

### Parameters

*   `url`: The URL of the API endpoint to fetch data from.
*   `options` (optional): An object of options to pass to the `fetch` request.

### Returns

An object with the following properties:

*   `data`: The data returned from the API.
*   `loading`: A boolean that is `true` when the data is being fetched and `false` otherwise.
*   `error`: An error object if the fetch fails, and `null` otherwise.
*   `post`: A function that you can use to send a `POST` request to the API.

### Example

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
