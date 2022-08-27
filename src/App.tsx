import React from "react";
import "./App.scss";
import { ModsPage } from "./pages/ModsPage/ModsPage";




export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <ModsPage />
      </div>
    );
  };
}