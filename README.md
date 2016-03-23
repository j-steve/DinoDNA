# DinoDNA

http://dinodna.herokuapp.com/

## Development

As of right now all of the build artifacts are stored in the repo under `/public`, so pulling the latest from remote and running the following commands should get you up and running:

```bash
$ npm install
$ npm start
```

If you're hacking on the client-side code you'll need to build a new bundle after making changes:

```bash
$ npm run build
```

This command just executes webpack and generates `/public/js/bundle.js` with any changes you've made. The source files and destination path are all specfied in the `webpack.config.js` file.

Pro Tip - If you know you want to spin up the web server to test out changes after build just use `npm run go`.

## TODO

* Investigate/implement react-router (how can we use it while taking advantage of server-side rendering?)
* Investigate/implement Redux
* Define client-side app flow
* Implement comparison of two sets of DNA