const github = require('@actions/github');
const core = require('@actions/core');
const client = require('./client.js');

// ensures that only a label with this prefix exists
async function ensureOnlyLabel(issue, labelName, validLabels, colors) {
    const currentLabels = issue.labels.map(label => label.name.toLowerCase());
    console.log("current");
    console.log(currentLabels);

    // add, but first ...
    // remove any other status labels not the desired one
    for (const candidate of validLabels) {
        // if the candidate label is currently set
        // but it's not the desired label, remove it
        if (currentLabels.indexOf(candidate.toLowerCase()) >= 0 && candidate.toLowerCase() !== labelName.toLowerCase()) {
            console.log(`Removing label: ${candidate}`)
            await client.removeIssueLabel(issue.html_url, candidate);
        }
    }

    if (currentLabels.indexOf(labelName.toLowerCase()) >= 0) {
        console.log(`Label '${labelName}' already exists on issue`);
    } else {
        const candidates = validLabels.map(label => label.toLowerCase())
        console.log(candidates);
        console.log(labelName);
        const index = candidates.indexOf(labelName.toLowerCase())
        console.log(index);
        let color = 'FFFFFF'
        if (index < colors.length) {
            color = colors[index];
        }

        console.log(`Adding label: ${labelName} with color ${color}`)

        if (!color) {
            console.log("no matching color specified.");
            return;
        }

        await client.ensureIssueHasLabel(issue.html_url, labelName, color);
    }
}

async function run() {
    // This should be a token with access to your repository scoped in as a secret.
    // The YML workflow will need to set myToken with the GitHub Secret Token
    // myToken: ${{ secrets.GITHUB_TOKEN }}
    // https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret
    const token = core.getInput('token');

    if (github.context.eventName !== 'issue_comment') {
        console.log("not an issue comment. nothing to do.")
    }

    if (!github.context.payload.comment.body || !github.context.payload.issue) {
        console.log("no comment or issue.  nothing to do");
    }

    let validLabels = core.getInput('labels').split(',');
    validLabels = validLabels.map(label => label.trim());

    let colors = core.getInput('colors').split(',');
    colors = colors.map(color => color.trim());

    const octokit = github.getOctokit(token);
    client.init(octokit);

    let body = github.context.payload.comment.body;
    let lines = body.split('\n');
    let labeled = false;
    for (let line of lines) {
        if (line.toLowerCase().startsWith("status")) {
            let parts = line.split(':');
            if (parts.length == 2) {
                let label = parts[1].toLowerCase();
                await ensureOnlyLabel(github.context.payload.issue, label.trim(), validLabels, colors );
                labeled = true;
            }
        }
    }
    if (!labeled) {
        console.log("no labels added.  could not find status: comment");
    }
}

run();