import React, { Component } from 'react';

export default class LinkProtect extends Component {
    constructor(props) {
        super(props);

        this.state = {
            origLink: '',
            recentResult: ''
        };

        this.handleFormChange = this.handleFormChange.bind(this);
        this.stripLink = this.stripLink.bind(this);
        this.resetForm = this.resetForm.bind(this);
    }

    handleFormChange(event) {
        const target = event.target;
        const value = target.value;
        const name = target.name;
        this.setState({ [name] : value });
    }

    stripLink() {
        let input = document.getElementById('origLink').value;
        let result = '';
        if(!input) { result = 'ERROR: No input.'; }
        else if(input.match(/^https:\/\/linkprotect\.cudasvc\.com\/url\?a=.*$/gi)) {
            result = input.toString().split("=", 2)[1].split("&",2)[0].replace(/^3D/i,'');
            result = decodeURIComponent(result);
        } else { result = 'ERROR: Input is not a Barracuda Link-Protected link.'; }

        this.setState({recentResult:result});
    }

    resetForm() {
        this.setState({origLink:'',recentResult:''});
    }

    render() {
        return (
            <div>
                <h1>{"Strip LinkProtect Wrapper"}</h1>
                <p>
                    {"Unwrap links from the Barracuda LinkProtect service. Link stuck in "}
                    <a href="https://en.wikipedia.org/wiki/Quoted-printable#Example" target="_blank" rel="noopener noreferrer">
                    {"quoted printable encoding"}</a>{"? --> "}
                    <a href="https://www.motobit.com/util/quoted-printable-decoder.asp" target="_blank" rel="noopener noreferrer">
                    {"Decode it"}</a>
                </p>
                <textarea name="origLink" id="origLink" onChange={(e)=>{this.handleFormChange(e);}}
                 placeholder="Original Link..." className="form-input"
                 style={{'height':'200px'}} value={this.state.origLink} />
                <br />
                <input type="button" value="Strip" onClick={()=>{this.stripLink();}} />
                <input type="button" value="Reset" onClick={()=>{this.resetForm();}} />
                <br /><br />
                <div className="results-area">
                    <code>{this.state.recentResult}</code>
                </div>
            </div>
        )
    }
};
