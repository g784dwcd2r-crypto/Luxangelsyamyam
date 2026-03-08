import React from 'react';

function App(props) {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>{...props}</p>
    </div>
  );
}

export default App;