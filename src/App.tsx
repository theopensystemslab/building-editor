import React from "react";

const App: React.FC = () => (
  <nav id="navigation-links">
    <ul style={{ lineHeight: 2 }}>
      <li>
        <a href="./hangar">Hangar</a>
      </li>
      <li>
        <a href="./building">Building</a>
      </li>
      <li>
        <a href={process.env.REACT_APP_COSMOS_URL}>Cosmos</a>
      </li>
      <li>
        <a href={process.env.REACT_APP_REPOSITORY_URL}>GitHub Repository</a>
      </li>
    </ul>
  </nav>
);

export default App;
