import React, { Component } from 'react';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import './App.css';

import FilterFixer from './Components/FilterFixer/FilterFixer';
import LinkProtect from './Components/LinkProtect/LinkProtect';
import GeoIP from './Components/GeoIP/GeoIP';

export default class App extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="App">
                <div id="inner-app">
                        <img src="resources/barracudaLogo.svg" id="tool-logo" alt="" />
                        <br />
                        <span id="header-text">{"Support Tools"}</span>
                    <hr />
                    <div id="nav-menu-wrapper">
                        <ul id="nav-menu">
                            <NavLink to="/FilterFixer" activeClassName="nav-menu-selected"
                             title="Migrate filters from Barracuda ESG to ESS.">
                                <li>{"FilterFixer"}</li>
                            </NavLink>
                            <NavLink to="/LinkProtect" activeClassName="nav-menu-selected">
                                <li>{"LinkProtect"}</li>
                            </NavLink>
                            <NavLink to="/GeoIP" activeClassName="nav-menu-selected">
                                <li>{"GeoIP"}</li>
                            </NavLink>
                        </ul>
                    </div>
                    <hr />
                    <div id="switch-wrapper">
                        <Switch>
                            <Route exact path="/" render={()=>{return <Redirect to="/FilterFixer/Home" />;}} />
                            <Route exact path="/FilterFixer" render={()=>{return <Redirect to="/FilterFixer/Home" />;}} />
                            <Route path="/FilterFixer" component={()=>{return <FilterFixer />;}} />
                            <Route path="/LinkProtect" component={()=>{return <LinkProtect />;}} />
                            <Route path="/GeoIP" component={()=>{return <GeoIP />;}} />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }
}
