import React, {Component} from 'react';
import {Navigation} from "./components/Navigation";
import Footer from "./components/Footer";
import HardwareList from "./components/inventory/HardwareList";
import {ToastProvider} from 'react-toast-notifications';

class App extends Component {
  render() {
    return (
        <div style={{
          width: '100%',
          maxWidth: 960,
          margin: '0 auto'
      }}>
            <ToastProvider placement="top-center"
            >
                <Navigation/>
                <div style={{
                    textAlign: 'left'
                }}>
                    <HardwareList requestsEnabled={true}>
                    </HardwareList>
                </div>
                <Footer/>
            </ToastProvider>
      </div>
    );
  }
}

export default App;
