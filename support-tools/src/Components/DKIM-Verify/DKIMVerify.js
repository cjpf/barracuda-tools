import React, { Component } from 'react';

export default class DKIMVerify extends Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div>
                <h1>{"DKIM Verification Tool"}</h1>
                <input type="file" id="emlpicker" accept=".eml" />
                <input type="button" value="Verify"/>
            </div>
        )
    }
}
