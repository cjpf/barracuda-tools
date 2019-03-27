import React, { Component } from 'react';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';

export default class FilterFixer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formErrors : ''
        };
    }

    parseFilter(value, type) {
        // Parse the 'value' field based on 'type' and set error state appropriately.
        //alert('value:\n'+value);
        //alert('type: '+type);

        // Split the input by new-line character.
        let valArray = value.split('\n');
        // Define a new empty array to push results onto.
        let resArray = [];
        // Define the stringified version of the final results array above.
        //  For now, this will be just put into a window alert for the user to capture the results.
        let returnMe = "";

        // For each line, trim whitespace from the input and begin conversion.
        for(let i = 0; i < valArray.length; i++) {
            let line = valArray[i].trim();
            // Empty line? Move on.
            if(line === '') { continue; }

            // Tee some initial variables.
            let result, pieces = "";
            // Process the line based on the type of conversion being done.
            switch(type) {
                case "IP" : {
                    // Does the line begin with two full IPv4 formats? if not, remove it from the results.
                    if(!line.match(/^((\d{1,3}\.){3}\d{1,3},){2}/i)) { continue; }
                    // Split up the line along the commas.
                    pieces = line.split(",");
                    // Does this contain one of the block keywords?
                    let isBlock = (pieces[2].match(/^(Block|Quarantine|Tag)$/gi) ? true : false);
                    // Put together the first part of the result.
                    result = pieces[0]+","+pieces[1]+","+(isBlock === true ? "block" : "exempt")+",";
                    // Shift off the first two sections, which are guaranteed to be at least IP & Netmask.
                    pieces.shift(); pieces.shift();
                    // If it's a message that included one of the keywords above, shift the third piece off.
                    if(isBlock) { pieces.shift(); }
                    // Now add all the final pieces to the string. This preseves the WHOLE comment,
                    //   rather than breaking off at the first comma.
                    result += pieces;
                    break; }
                case "Sender" : {
                    if(!line.match(/^(.+\.[0-9a-z\-\.]{2,})/gi)) { continue; }
                    pieces = line.split(",");
                    result = pieces[0]+",";
                    if(pieces[pieces.length-1].match(/^(Quarantine|Tag)$/gi)) { result += "quarantine"; }
                    else if(pieces[pieces.length-1].match(/^(Block)$/gi)) { result += "block"; }
                    else { result += "exempt"; }
                    result += ","+pieces.splice(1,pieces.length-2);
                    break; }
                case "Recipient" : {
                    // This will drop anything that isn't an EMAIL ADDRESS specifically.
                    if(!line.match(/^\/?([a-z0-9+\-_.=%]+@[a-z0-9.\-]+\.[a-z0-9]{2,})\/?/gi)) { continue; }
                    pieces = line.split(",");
                    if(pieces[1].match(/^(Quarantine|Tag|Block)$/gi)) { continue; }
                    result = pieces;
                    break; }
                case "Content" : {
                    // Ignore any line that doesn't end with three consecutive digits with commas between them.
                    if(!line.match(/(,\d,\d,\d)$/gi)) { continue; }
                    // Replace instances of 3+ double-quotes with: " *""+
                    line = line.replace(/^"{3,}/g,'" *""+').replace(/"{3,},/,'""+ *",');
                    // Grab the filter from a lone single-quote to a lone single-quote appropriately
                    let pattern = line.match(/^((".+?[^"]",)|([^"].+?,))/gi);
                    // Strip the pattern field off.
                    line = line.replace(/^((".+?[^"]",)|([^"].+?,))/gi,'');

                    // Now do the same thing again (slight variation) to replace ANY comments.
                    line = line.replace(/^((".+?[^"]",)|([^",].*?,)|(^,))/gi,'');

                    alert(pattern+"\n\n"+line);
                    pieces = line.split(",");
                    break; }
                case "Attachment" : {

                    break; }
                default: continue;
            }

            // Push the result onto the results array.
            resArray.push(result);
        }

        // Remove dupes from resArray here.

        if(type !== "Content") {
            // Build the results string from the results array, and output it.
            for(let x = 0; x < resArray.length; x++) {
                returnMe += "\n"+resArray[x].toString();
            }
            alert(returnMe);
        } else {
            // Build an "Inbound" and "Outbound" results window.
        }
    }

    // By calling a state update, we effectively shred the form from the Route object.
    resetForm() { this.setState({}); }

    render() {
        return (
            <div>
                <div id="nav-menu-wrapper">
                    <ul id="nav-menu">
                        <NavLink exact to="/FilterFixer/Home" activeClassName="nav-menu-selected">
                            <li>{"Home"}</li>
                        </NavLink>
                        <NavLink to="/FilterFixer/Dedupe" activeClassName="nav-menu-selected">
                            <li>{"De-Duplicate"}</li>
                        </NavLink>
                        <NavLink to="/FilterFixer/IP" activeClassName="nav-menu-selected">
                            <li>{"IP Filters"}</li>
                        </NavLink>
                        <NavLink to="/FilterFixer/Sender" activeClassName="nav-menu-selected">
                            <li>{"Sender Filters"}</li>
                        </NavLink>
                        <NavLink to="/FilterFixer/Recipient" activeClassName="nav-menu-selected">
                            <li>{"Recipient Filters"}</li>
                        </NavLink>
                        <NavLink to="/FilterFixer/Content" activeClassName="nav-menu-selected">
                            <li>{"Content Filters"}</li>
                        </NavLink>
                        <NavLink to="/FilterFixer/Attachment" activeClassName="nav-menu-selected">
                            <li>{"Attachment Filters"}</li>
                        </NavLink>
                    </ul>
                </div>
                <hr />
                <Route path={'/FilterFixer/:whichFilter'}
                 component={(e)=>{
                     return <Filter formErrors={this.state.formErrors} reset={()=>{this.resetForm();}}
                        submission={(a,b)=>{this.parseFilter(a,b);}} which={e.match.params.whichFilter} />;}
                 } />
            </div>
        );
    }
};

function Filter(props) {
    let textDisplay = {__html : "<p></p>"};
    switch(props.which) {
        case "Home":
            textDisplay = {__html : `<h1>Migrate Filters From BESG to BESS</h1>
            <p>Change the formatting from BESG-style to BESS-style, sorting the output and removing duplicates.</p>
            <h3>Important Notes:</h3>
            <p><ul>
                <li>Allowed and blocked lists for IP and Sender filters can be added at the same time, they will be combined into a single list.</li>
                <li>Any Recipient block entries will be removed as these are not supported by BESS.</li>
                <li>Tag will always be changed to Quarantine and filters not supporting Quarantine will be set to Block instead.</li>
                <li>Any entries that aren't valid for the type of filter being listed (for example, a sender policy in the IP filters section) will be silently discarded from the result.</li>
            </ul></p>`};
            break;
        case "Dedupe" :
            textDisplay = {__html : `<h2>De-Duplication</h2>
            <p>Remove duplicates from a list of policies. This does <strong>not</strong> need to be done for each filter,
            since it is automatically done when using any of the other FilterFixer tools.</p>`}
            break;
        case "IP" :
            textDisplay = {__html : `<h2>IP Filters</h2>
            <p><strong>Required formatting:</strong>
            <ul><li>IP/Network Address,Netmask,Comment</li>
            <li>IP/Network Address,Netmask,Action,Comment</li>
            </ul><i>You can enter allowed and blocked filters together.</i></p>`}
            break;
        case "Sender" :
            textDisplay = {__html : `<h2>Sender Filters</h2>
            <p><strong>Required formatting:</strong>
            <ul><li>Email Address/Domain,Comment</li>
            <li>Email Address/Domain,Comment,Action</li>
            </ul><i>You can enter allowed and blocked filters together. TLD filters are dropped.</i></p>`}
            break;
        case "Recipient" :
            textDisplay = {__html : `<h2>Recipient Filters</h2>
            <p><strong>Required formatting:</strong>
            <ul><li>Email Address/Domain,Comment</li>
            </ul><i><span style="color:var(--accent-color)">NOTE:</span> Only add allowed recipients,
            BESS doesn't allow blocking based on recipient (at least under Recipient Policies). Recipient Blocks will be removed.</i></p>`}
            break;
        case "Content" :
            textDisplay = {__html : `<h2>Content Filters</h2>
            <p><strong>Required formatting:</strong>
            <ul><li>Pattern,Comment,Inbound Action,Outbound Action,Subject,Header,Body</li>
            </ul><i><span style="color:var(--accent-color)">NOTE:</span> Generated filters with <strong>commas</strong>
            inside of the "pattern" section will be encapsulated in double-quotes so that they can be added to ESS in Bulk-Edit
            format.</i></p>`}
            break;
        case "Attachment" :
            textDisplay = {__html : `<h2>Attachment Filters</h2>
            <p><strong>Required formatting:</strong>
            <ul><li>Filename Pattern,Comment,Inbound Action,Outbound Action,Check Archives</li>
            </ul></p>`}
            break;
        default: break;
    }
    return props.which !== 'Home' ? (
        <div>
            <div dangerouslySetInnerHTML={textDisplay} />
            <textarea name="origBulk" id="origBulk" placeholder="Original ESG Bulk-Edit Filters..."
             className="form-input" style={{'height':'200px'}} /><br />
            <input type="button" value="Convert"
             onClick={()=>{props.submission(document.getElementById('origBulk').value.toString(),props.which);}} />
            <input type="button" value="Reset" onClick={()=>{props.reset();}} />
            <div className="form-errors">{props.formErrors}</div>
        </div>
    ) : (<div dangerouslySetInnerHTML={textDisplay} />);
};
