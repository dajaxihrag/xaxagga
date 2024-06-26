import React, { useEffect, useState } from 'react'
import {
  Routes,
  Route,
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Home from './components/Home';

const App = () => {
  document.title = 'Home TAB';


  return (
  <div className="container">
    <h1>This is App.js</h1>
  </div>
  )

}

export default App;
