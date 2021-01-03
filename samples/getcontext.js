const fs = require('fs');
const path = require('path');

// "token": "***",
// "repository": "bryanmacfarlane/actions-playground",
// "repository_owner": "bryanmacfarlane",
// "repositoryUrl": "git://github.com/bryanmacfarlane/actions-playground.git",
// "event_name": "push",

let contents = fs.readFileSync(path.join(__dirname, "event.json")).toString();
let context = {};
let payload = JSON.parse(contents);
context["token"] = process.env["GH_PAT"];
context["repository"] = payload.repository.full_name;
context["repository_owner"] = payload.repository.owner.login;
context["event"] = payload;

console.log(JSON.stringify(context, null, 2));