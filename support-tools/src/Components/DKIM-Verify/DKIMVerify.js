import React, { Component } from "react";

export default class DKIMVerify extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emailContent: "",
      DKIM_RECORD: [],
      body: "",
      header: "",
      dkimVersion: "",
      signingAlgo: "",
      signatureField: "",
      extractedBodyHash: "",
      signingDomain: "",
      signedHeaders: "",
      selector: "",
      DKIM_CANON: "",
      DKIM_CANON_BODY: "",
      DKIM_CANON_HEADER: "",
    };

    this.checkFileAPI = this.checkFileAPI.bind(this);
    this.getFile = this.getFile.bind(this);
    this.getSignature = this.getSignature.bind(this);
    this.getField = this.getField.bind(this);
    this.extractSignature = this.extractSignature.bind(this);
    this.fetchDKIM = this.fetchDKIM.bind(this);
    this.getEmailSections = this.getEmailSections.bind(this);
    this.getSigCanon = this.getSigCanon.bind(this);
  }

  checkFileAPI() {
    if (
      !window.File ||
      !window.FileReader ||
      !window.FileList ||
      !window.Blob
    ) {
      alert("The File APIs are not supported in this browser.");
      return;
    }
    console.log("File API Supported.");
  }

  getFile() {
    console.log("Getting file from input.");
    this.checkFileAPI();
    // create FileReader and get first file - this can be made to read multiple files in the future
    const reader = new FileReader();
    let file = document.getElementById("fileinput").files[0];
    reader.readAsText(file);

    // success callback for reader.readAsText()
    reader.onload = event => {
      console.log("FileReader success.");
      var fileContent = reader.result;
      this.setState({ emailContent: fileContent });
      this.extractSignature();
    };

    // error callback for reader.readAsText()
    reader.onerror = event => {
      console.log("FileReader error.");
    };
  }

  getEmailSections(rawemail) {
    this.header = rawemail.split(/(\r\n){2}/m)[0];
    this.body = rawemail.replace(/(.|\r|\n)*?(\r\n){2}/m, "");
  }

  getSignature(headers) {
    let tempVar = headers.match(
      /(\r\n)(DKIM-Signature:(.|\r|\n)*?)(\r\n)[a-z0-9.-_]/gim
    );
    // The above "match" will always catch an extra three characters: \r, \n, and *, so trim them off.
    //  It will also start with the leading CRLF, so trim that too.
    // NOTE: Using [0] ensures that the first (most-recent) DKIM-Signature field is used.
    if (!tempVar) {
      return null;
    }
    tempVar = tempVar[0].substring(2, tempVar[0].length - 3);
    return tempVar;
  }

  getField(tagName, signature) {
    let expression = `\\b${tagName}=.*?(;|$)`;
    let regex = new RegExp(expression, "gim");
    let tempVar = signature.match(regex);
    if (!tempVar) {
      return null;
    }
    return tempVar[0].replace(/;\s*$/, "");
  }

  getPublicKey() {
    var QUERY_STRING =
      this.selector.slice(2) + "._domainkey." + this.signingDomain.slice(2);
    this.fetchDKIM(QUERY_STRING);
    // TODO Check for No DNS TXT Record for selector
    // TODO Check for No pubkey field in the record (p=)
    // TODO Strip semi-colons and p=
    // TODO Add BEGIN and END tags to the key
    // TODO Verify that the key is valid
    // TODO indicate pass/fail to user
  }

  // getSigCanon
  // Get the canonicalization of the DKIM Signature. Set to defaults as necessary.
  // If no canonicalization algorithm is specified by the Signer, the "simple" algorithm defaults for both header and body.
  getSigCanon() {
    this.DKIM_CANON = this.getField("c", this.normalizedSignature);
    console.log(this.DKIM_CANON);
    if (this.DKIM_CANON.match("/")) {
      // Both are explicitly defined, get them.
      let dkim_strings = this.DKIM_CANON.split("/");
      this.DKIM_CANON_HEADER = dkim_strings[0].split("=")[1];
      this.DKIM_CANON_BODY = dkim_strings[1];
    } else if (this.DKIM_CANON === "") {
      // No canon. specified, set to defaults (simple/simple).
      this.DKIM_CANON_HEADER = "simple";
      this.DKIM_CANON_BODY = "simple";
    } else {
      // No slash character, only one specification means that the header canon. is explicitly defined. Body is default.
      this.DKIM_CANON_HEADER = this.DKIM_CANON.split("=")[1];
      this.DKIM_CANON_BODY = "simple";
    }

    // If anything came out NOT simple or relaxed, set them to simple.
    if (
      this.DKIM_CANON_HEADER !== "simple" &&
      this.DKIM_CANON_HEADER !== "relaxed"
    ) {
      this.DKIM_CANON_HEADER = "simple";
    }
    if (this.DKIM_CANON_BODY !== "simple" && this.DKIM_CANON_BODY !== "relaxed") {
      this.DKIM_CANON_BODY = "simple";
    }
    document.getElementById("dkim-canon-area").value =
      "Header Canon: " +
      this.DKIM_CANON_HEADER +
      "\nBody Canon: " +
      this.DKIM_CANON_BODY;
    console.log(this.DKIM_CANON_HEADER);
    console.log(this.DKIM_CANON_BODY);
  }

  extractSignature() {
    console.log("Extracting DKIM Signature...");
    // Ensure CRLF line endings.
    var rawemail = this.state.emailContent.replace(/\r?\n/gm, "\r\n");

    // Chop up the raw email into the header/body sections.
    this.getEmailSections(rawemail);

    // Get the most recent DKIM-Signature field from the headers.
    this.fullSignature = this.getSignature(this.header);
    if (!this.fullSignature) {
      alert("DKIM PERMFAIL: No DKIM-Signature header found.");
      return;
    }
    console.log("FULL SIGNATURE: " + this.fullSignature);
    //document.getElementById('dkim-signature-area').value = this.fullSignature;

    // "Normalize" the signature to pass to the "getField" function as needed.
    //  This "unwraps" or "unfolds" (per RFC terminology) the DKIM-Signature header.
    this.normalizedSignature = this.fullSignature
      .trim()
      .replace(/(\r\n)(\s|\t)+/gim, "")
      .replace(/(\s+(?![^=]{3}))/gim, "");
    console.log("NORMALIZED SIGNATURE: " + this.normalizedSignature);
    document.getElementById(
      "dkim-signature-area"
    ).value = this.normalizedSignature;

    /* Per RFC 6376, Section 3.5:
     * DKIM-Signature header fields MUST include the following tags:
     *  v, a, b, bh, d, h, and s ---- all other tags are optional.
     */
    this.dkimVersion = this.getField("v", this.normalizedSignature);
    this.signingAlgo = this.getField("a", this.normalizedSignature);
    this.signatureField = this.getField("b", this.normalizedSignature);
    this.extractedBodyHash = this.getField("bh", this.normalizedSignature);
    this.signingDomain = this.getField("d", this.normalizedSignature);
    this.signedHeaders = this.getField("h", this.normalizedSignature);
    this.selector = this.getField("s", this.normalizedSignature);

    if (
      !this.dkimVersion ||
      !this.signingAlgo ||
      !this.signatureField ||
      !this.extractedBodyHash ||
      !this.signingDomain ||
      !this.signedHeaders ||
      !this.selector
    ) {
      // The DKIM result fails.
      alert("DKIM PERMFAIL: signature incomplete or missing fields.");
      return;
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
    this.getPublicKey();
    this.getSigCanon();
  }

  fetchDKIM(hostname) {
    fetch("/api/dkim/" + hostname)
      .then(results => results.json())
      .then(DKIM_RECORD =>
        this.setState({ DKIM_RECORD }, () => {
          console.log("DKIM RECORD FETCHED", DKIM_RECORD);
          document.getElementById("dkim-publickey-area").value = DKIM_RECORD;
        })
      );
  }

  render() {
    return (
      <div>
        <h1>{"DKIM Verification Tool"}</h1>
        <input type="file" id="fileinput" accept=".eml" />
        <input
          type="button"
          value="Verify"
          onClick={() => {
            this.getFile();
          }}
        />
        {/* <input
          type="button"
          value="getPublicKey"
          onClick={() => {
            this.getPublicKey();
          }}
        />
        <input
          type="button"
          value="getSigCanon"
          onClick={() => {
            this.getSigCanon();
          }}
        /> */}
        <br />
        <br />
        <label>DKIM Signature</label>
        <br />
        <textarea
          name="dkim-signature-area"
          id="dkim-signature-area"
          className="form-input"
          style={{ height: "150px" }}
          disabled
        />
        <br />
        <br />
        <label>Public Key</label>
        <br />
        <textarea
          name="dkim-publickey-area"
          id="dkim-publickey-area"
          className="form-input"
          style={{ height: "100px" }}
          disabled
        />
        <br />
        <br />
        <label>Canonicalization</label>
        <br />
        <textarea
          name="dkim-canon-area"
          id="dkim-canon-area"
          className="form-input"
          style={{ height: "50px" }}
          disabled
        />
      </div>
    );
  }
}
