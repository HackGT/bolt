import React, { Component } from 'react';
import './App.css';
import {AnchorButton, Button, H1, H2} from "@blueprintjs/core";
import {Navigation} from "./components/Navigation";
import Footer from "./components/Footer";

class App extends Component {
  render() {
    return (
      <div className="App">
          <Navigation/>
          <H1>Welcome to Bolt!</H1>
          <H2>Hardware checkout, reimagined</H2>
          <Footer/>
      </div>
    );
  }
}

export default App;
