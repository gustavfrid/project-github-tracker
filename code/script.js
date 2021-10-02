const projects = document.getElementById('projects');
const userData = document.getElementById('userData');

const USER = 'gustavfrid';
const PARENT_OWNER = 'Technigo';
const REPOS_URL = `https://api.github.com/users/${USER}/repos`;
const USER_URL = `https://api.github.com/users/${USER}`;

const pullReqData = {
	total: 19,
	done: 0,
};

const fetchAllReposFromUser = () => {
	// fetch all repos from user
	fetch(REPOS_URL)
		.then((res) => res.json())
		.then((allRepos) => {
			// filter forked repos
			let filteredRepos = allRepos.filter((repo) => repo.name.includes('project-') && repo.fork);
			filteredRepos.sort((a, b) => {
				if (a.pushed_at > b.pushed_at) {
					console.log('sort a.pushed_at > b.pushed_at', a.pushed_at, b.pushed_at);
					return -1;
				} else if (a.pushed_at < b.pushed_at) {
					return 1;
				} else {
					return 0;
				}
			});
			console.log('filtered repos: ', filteredRepos);
			filteredRepos.slice(0, 4).forEach((repo) => {
				// fetch all data for each repo use .slice(0, 2) to limit
				// createProjectCard(repo);
				fetchFullRepo(repo);
			});
		})
		.catch((err) => console.log('fetchAllReposFromUser error: ', err));
};

const fetchFullRepo = (repo) => {
	// fetch all data from each repo
	fetch(`${repo.url}`)
		.then((res) => res.json())
		.then((fullRepo) => {
			// only continue with repos that have PARENT_OWNER as parent
			if (fullRepo.parent.owner.login === PARENT_OWNER) {
				// put data in html
				// console.log('fullRepo', fullRepo.name);
				populateProjectCard(fullRepo);
				const COMMITS_URL = `https://api.github.com/repos/${USER}/${fullRepo.name}/commits?per_page=100`;
				fetchCommits(COMMITS_URL, fullRepo);
			}
		})
		.catch((err) => console.log('fetchFullRepo error:', err));
};

const createProjectCard = (repo) => {
	projects.innerHTML += /*html*/ `
	<div class="repo-info">
	</div>
	`;
};

const populateProjectCard = (repo) => {
	projects.innerHTML += /*html*/ `
	<div class="repo-info">
		<p class="repo"><a href=${repo.html_url} target="_blank">${repo.name}</a></p>
		<p class="info">From ${repo.parent.owner.login}, default branch: ${repo.default_branch}</p>
		<p class="pull" id="pull-${repo.name}">Pull request</p>
		<p class="commit" id="commit-${repo.name}">Commits: </p>
		<p class="update">Updated: ${new Date(repo.pushed_at).toDateString()}</p>
		<p class="collaboration" id="collaborators-${repo.name}">Collaborators:</p>
	</div>
	`;
};

const fetchCommits = (myCommitsUrl, repo) => {
	fetch(myCommitsUrl)
		.then((res) => res.json())
		.then((data) => {
			// console.log(data);
			const commitsSinceFork = data.filter((commit) => commit.commit.author.date > repo.created_at);
			// console.log(commitsSinceFork);
			document.getElementById(`commit-${repo.name}`).innerHTML += ` ${commitsSinceFork.length}`;
			getCollaborators(commitsSinceFork, repo);
		})
		.catch((err) => console.log('fetchCommits error: ', repo.name, err));
};

const getCollaborators = (commits, repo) => {
	let authors = {};
	commits.forEach((commit) => {
		if (!Object.keys(authors).includes(commit.author.login)) {
			authors[commit.author.login] = { avatar_url: commit.author.avatar_url, html_url: commit.author.html_url };
		}
	});

	for (const author in authors) {
		if (Object.keys(authors).length > 1) {
			document.getElementById(
				`collaborators-${repo.name}`
			).innerHTML += /*html*/ `<a href="${authors[author].html_url}" target="_blank"><img class="avatar-collaborator" src="${authors[author].avatar_url}"></a>`;
		} else {
			document.getElementById(`collaborators-${repo.name}`).innerHTML = /*html*/ 'Individual project';
		}
	}

	fetchPullRequestsArray(repo, Object.keys(authors));
};

const fetchPullRequestsArray = (repo, authors) => {
	// fetch all pull requests from repo
	const PULL_URL = `https://api.github.com/repos/${PARENT_OWNER}/${repo.name}/pulls?per_page=100`;
	fetch(PULL_URL)
		.then((res) => res.json())
		.then((data) => {
			// console.log('fetchPullRequestsArray data: ', data);
			// only pick pull requests connected to user
			const myPullReq = data.find((pull) => authors.includes(pull.user.login));
			// console.log('myPullReq', repo.name, myPullReq);
			if (myPullReq) {
				document.getElementById(`pull-${repo.name}`).innerHTML = /*html*/ `<a href=${myPullReq.html_url} target="_blank">Pull request</a>`;
				pullReqData.done++;
				updatePieChart(pieChart, pullReqData.done);
			} else {
				document.getElementById(`pull-${repo.name}`).innerHTML = /*html*/ 'No pull request done :(';
			}
		})
		.catch((err) => console.log('fetchPullRequestsArray error:', err));
};

const fetchUser = () => {
	fetch(USER_URL)
		.then((res) => res.json())
		.then((data) => {
			// console.log(data);
			userData.innerHTML += /*html*/ `<a href="${data.html_url}" target="_blank"><img class="avatar-user" src="${data.avatar_url}"></a><p class="user-name">${data.login}</p>`;
		})
		.catch((err) => console.log('fetchCommits error: ', err));
};

fetchAllReposFromUser();
fetchUser();
// drawPieChart(19,0);
