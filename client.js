let url = require('url');

let _octokit;
exports.init = function (octokit) {
    _octokit = octokit;
}

exports.issueParts = function (issueUrl) {
    const issURL = new url.URL(issueUrl)

    // apiUrl: https://api.github.com/repos/bryanmacfarlane/quotes-feed/issues/9
    // htmlUrl: https://github.com/bryanmacfarlane/quotes-feed/issues/9
    const apiUrl = issURL.host.startsWith('api.')

    const parts = issURL.pathname.split('/').filter(e => e)
    const owner = parts[apiUrl ? 1 : 0]
    const repo = parts[apiUrl ? 2 : 1]
    const issue_number = parts[apiUrl ? 4 : 3]

    return {
        owner,
        repo,
        issue_number
    }
}

exports.ensureIssueHasLabel = async function (issueUrl, name, color) {
    const issueParts = module.exports.issueParts(issueUrl);
    await module.exports.ensureLabel(issueParts.owner, issueParts.repo, name, color);

    const labels = [name]
    const res = await _octokit.issues.addLabels({
        ...issueParts,
        labels
    })
    console.log('added')
}

exports.removeIssueLabel = async function (issueUrl, name) {
    await _octokit.issues.removeLabel({
        ...module.exports.issueParts(issueUrl),
        name
    })
    console.log(`removed ${name}`)
}

exports.ensureLabel = async function (owner, repo, name, color) {
    console.log(`ensure label ${owner} ${repo} ${name} ${color}`)

    try {
        const res = await _octokit.issues.getLabel({
            owner,
            repo,
            name
        })

        console.log(`${name} exists`)
        return
    } catch {
        console.log(`Creating label ${name} ${color}`)
    }

    // create
    const res = await _octokit.issues.createLabel({
        owner,
        repo,
        name,
        color
    })
    console.log('created')
}