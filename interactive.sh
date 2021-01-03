#!/bin/bash -e

if [ -z "$GH_PAT" ]; then
    echo "set GH_PAT"
    exit 1
fi

export GITHUB_EVENT_PATH=$(pwd)/samples/event.json
export GITHUB_CONTEXT=$(node ./samples/getcontext.js)
export GITHUB_REPOSITORY=bryanmacfarlane/bots-sample2
export GITHUB_EVENT_NAME=issue_comment

function print() {
    echo
    echo "-----------------------"
    echo "${1}:"
    echo "${!1}"    
}

print GITHUB_EVENT_PATH
print GITHUB_EVENT_NAME
print GITHUB_REPOSITORY
print GITHUB_CONTEXT
echo

export INPUT_TOKEN=${GH_PAT}
export INPUT_LABELS="green, yellow, red"
export INPUT_COLORS="22a524, fbca04, b60205"
npm run build
node ./index.js
