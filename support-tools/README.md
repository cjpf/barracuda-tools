# Support Tools
This is the actual web-form source for implementing all of the Barracuda Tools mentioned in the parent directory's README file.

This tool consists of a ReactJS application, written to rely solely on the computing power of a client browser's JavaScript engine, rather than loading a web server with anything more than serving the content itself.

All tools must be final before submitting a publicly-accessible version of the tool, since the service-worker class will allow it to remain cached completely in the client's web browser (gfor accelerated load-times).

## Structure (via React HashRouter)
* /barracuda/
    * FilterFixer/
    * LinkProtect/
