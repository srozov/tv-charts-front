import './App.css';
import Dashboard from "./Dashboard";
import {Spinner} from "react-bootstrap";
import React, {Suspense} from "react";

function App() {

  return (
    <div className="App">
      <header>
          tv-lightweight-charts Example
      </header>
        <Suspense fallback={<Spinner animation="border" />}>
            <Dashboard/>
        </Suspense>
    </div>

  );
}

export default App;
