import React, { Component } from 'react';
import './App.css';
import {AnchorButton, Button, H1, H2} from "@blueprintjs/core";
import {Navigation} from "./components/Navigation";
import Footer from "./components/Footer";
import {Login} from "./components/auth/Login";

class App extends Component {
  render() {
    return (
      <div className="App"
      style={{
          width: '100%',
          maxWidth: 960,
          margin: '0 auto'
      }}>
          <Navigation/>
          <H1>Welcome to Bolt!</H1>
          <H2>Hardware checkout, reimagined</H2>
          <Login />
          <Footer/>
      </div>
    );
  }
}

export default App;
