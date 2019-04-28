import React, { Component } from "react";

export default class DKIMVerify extends Component {
  constructor(props) {
    super(props);

        this.state = {
            emailContent: ''
        };

        // bindings
        this.checkFileAPI = this.checkFileAPI.bind(this);
        this.getFile = this.getFile.bind(this);
        // this.getResult = this.getResult.bind(this);
        // this.buildResult = this.buildResult.bind(this);
        this.getSignature = this.getSignature.bind(this);
        this.getField = this.getField.bind(this);
        this.hexdump = this.hexdump.bind(this);
        this.extractSignature = this.extractSignature.bind(this);
    }

    checkFileAPI() {
        if(!window.File || !window.FileReader || !window.FileList || !window.Blob) {
           alert('The File APIs are not supported in this browser.');
           return;
        }
        console.log('File API Supported.');
    }

    getFile() {
        console.log('Getting file from input.');
        this.checkFileAPI();
        // create FileReader
        const reader = new FileReader();

        // get first file - this can be made to read multiple files in the future
        let file = document.getElementById('fileinput').files[0];
        console.log(file);

        // When this finishes, one of the following callbacks will execute
        reader.readAsText(file);

        // success callback for reader.readAsText()
        reader.onload = (event) => {
            console.log('FileReader loaded file successfully.');
            var fileContent = reader.result;
            this.setState({emailContent: fileContent})            
            this.extractSignature();
        }

        // error callback for reader.readAsText()
        reader.onerror = (event) => {
            console.log('File reader error.');
        }
    }

    // Return the final "result" object (full JSON object).
    // getResult() {
    //     return this.buildResult();
    // }

    // buildResult() {
    //     return {
    //     };
    // }

    getSignature(headers) {
        let tempVar = headers.match(/(\r\n)(DKIM-Signature:(.|\r|\n)*?)(\r\n)[a-z0-9.-_]/mig);
        // The above "match" will always catch an extra three characters: \r, \n, and *, so trim them off.
        //  It will also start with the leading CRLF, so trim that too.
        // NOTE: Using [0] ensures that the first (most-recent) DKIM-Signature field is used.
        if(!tempVar) { return null; }
        tempVar = tempVar[0].substring(2, tempVar[0].length - 3);
        return tempVar;
    }

    getField(tagName, signature) {
        let expression = `\\b${tagName}=.*?(;|$)`;
        let regex = new RegExp(expression, 'gim');
        let tempVar = signature.match(regex);
        if(!tempVar) { return null; }
        return tempVar[0].replace(/;\s*$/,'');
    }

    // Debugging, delete later.
    hexdump(buffer, blockSize) {
        blockSize = blockSize || 16;
        var lines = [];
        var hex = "0123456789ABCDEF";
        for (var b = 0; b < buffer.length; b += blockSize) {
            var block = buffer.slice(b, Math.min(b + blockSize, buffer.length));
            var addr = ("0000" + b.toString(16)).slice(-4);
            var codes = block.split('').map(function (ch) {
                var code = ch.charCodeAt(0);
                return " " + hex[(0xF0 & code) >> 4] + hex[0x0F & code];
            }).join("");
            codes += "   ".repeat(blockSize - block.length);
            var chars = block.replace(/[\x00-\x1F\x20]/g, '.');
            chars +=  " ".repeat(blockSize - block.length);
            lines.push(addr + " " + codes + "  " + chars);
        }
        return lines.join("\n");
    }

    extractSignature() {
        console.log("extractSignature() executing.");
        //console.log("FULL EMAIL FILE: " + this.state.emailContent);
        // Ensure CRLF line endings.
        var rawemail = this.state.emailContent.replace(/\r?\n/mg, '\r\n');
        // Chop up the raw email into the header/body sections.
        this.header = rawemail.split(/(\r\n){2}/m)[0];
        this.body = rawemail.replace(/(.|\r|\n)*?(\r\n){2}/m, '');

        // Get the most recent DKIM-Signature field from the headers.
        this.fullSignature = this.getSignature(this.header);
        if(!this.fullSignature) { alert("DKIM PERMFAIL: No DKIM-Signature header found."); return; }
        console.log("FULL SIGNATURE: " + this.fullSignature);
        // "Normalize" the signature to pass to the "getField" function as needed.
        //  This "unwraps" or "unfolds" (per RFC terminology) the DKIM-Signature header.
        this.normalizedSignature =
            this.fullSignature.trim()
            .replace(/(\r\n)(\s|\t)+/gim, '')
            .replace(/(\s+(?![^=]{3}))/gim, '');
        console.log("NORMALIZED SIGNATURE: " + this.normalizedSignature);

        /* Per RFC 6376, Section 3.5:
            * DKIM-Signature header fields MUST include the following tags:
            *  v, a, b, bh, d, h, and s ---- all other tags are optional.
            */
        this.dkimVersion = this.getField("v",this.normalizedSignature);
        this.signingAlgo = this.getField("a",this.normalizedSignature);
        this.signatureField = this.getField("b",this.normalizedSignature);
        this.extractedBodyHash = this.getField("bh",this.normalizedSignature);
        this.signingDomain = this.getField("d",this.normalizedSignature);
        this.signedHeaders = this.getField("h",this.normalizedSignature);
        this.selector = this.getField("s",this.normalizedSignature);

        if(!this.dkimVersion || !this.signingAlgo || !this.signatureField || !this.extractedBodyHash
            || !this.signingDomain || !this.signedHeaders || !this.selector) {
            // The DKIM result fails.
            alert("DKIM PERMFAIL: signature incomplete or missing fields."); return;
        }

        /* Per RFC 6376, Section 3.6:
            * This document defines a single binding, using DNS TXT RRs to
            *  distribute the keys. Other bindings may be defined in the future.
            *
            * Also, Section 3.6.2.1: Namespace
            * All DKIM keys are stored in a subdomain named "_domainkey".  Given a
            *  DKIM-Signature field with a "d=" tag of "example.com" and an "s=" tag
            *  of "foo.bar", the DNS query will be for "foo.bar._domainkey.example.com".
            */
        let pubkeyURL = 'gmail.com';
        // TODO Send Lookup requests to server 
        // let pubkeyLookup = dns.lookup('gmail.com', (a,b) => {
        //     console.log(a+"\n"+b);
        // });
        console.log("PubKeyURL: " + pubkeyURL);
    
    }

    render() {
        return (
            <div>
                <h1>{"DKIM Verification Tool"}</h1>
                <input type="file" id="fileinput" accept=".eml" />
                <input type="button" value="Verify" onClick={()=>{this.getFile();}}/>
            </div>
        )
    }
}
