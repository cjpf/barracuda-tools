import React, { Component } from "react";

export default class DKIMVerify extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div>
        <h1>{"DKIM Verification Tool"}</h1>
        <form id="dkim-form" action="#" method="post">
          <input type="file" id="emlfile" accept=".eml" />
          <button type="submit" id="dkim-verify-button">
            Verify
          </button>
        </form>
      </div>
    );
  }
}
