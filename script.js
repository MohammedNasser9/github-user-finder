// Select DOM elements
const searchInp = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const errorContainer = document.getElementById('error-container');
const profileSection = document.getElementById('profile-section');

// Add event listener for search button click
searchBtn.addEventListener('click', searchUser);

// Allow search on pressing "Enter" key
searchInp.addEventListener('keydown', e => {
    if (e.key === 'Enter') searchUser();
});

// Main function to search for a GitHub user
async function searchUser() {
    errorContainer.classList.add('hidden');
    const username = searchInp.value;

    if (username.trim() === '') {
        errorContainer.textContent = 'Enter a valid username';
        errorContainer.classList.remove('hidden');
        return;
    }

    try {
        const res = await fetch(`https://api.github.com/users/${username}`);
        if (!res.ok) throw new Error('User Not Found 404!');
        const data = await res.json();
        const repos = await fetchRepos(data);
        displayProfile(data, repos);
    } catch (e) {
        errorContainer.textContent = `${e.message}`;
        errorContainer.classList.remove('hidden');
        profileSection.classList.add('hidden');
    }
}

// Display the complete user profile including repos
function displayProfile(data, repos) {
    profileSection.classList.remove('hidden');
    profileSection.innerHTML = `
        <div class="profile-header"></div>
        <div class="stats"></div>
        <div class="additional-info"></div>
        <div class="repos-container">
            <h3>Latest Repositories</h3>
            <div class="repos"></div>
        </div>
    `;
    profileSection.querySelector('.profile-header').innerHTML = renderHeader(data);
    profileSection.querySelector('.stats').innerHTML = renderStats(data);
    profileSection.querySelector('.additional-info').innerHTML = renderAdditionalInfo(data);
    profileSection.querySelector('.repos-container .repos').innerHTML = renderRepos(repos);
}

// Render user basic info section
function renderHeader(data) {
    return `
        <img src="${data.avatar_url}" alt="avatar profile">
        <div class="profile-info">
            <h2 id="name">${data.name || 'UnKnown'}</h2>
            <h3 id="username">@${data.login}</h3>
            <p id="bio">${data.bio || "No bio available"}</p>
            <div id="location-date">
                <p>
                    <i class="fas fa-map-marker-alt"></i>
                    <span id="location">${data.location || 'Not specified'}</span>
                </p>
                <p>
                    <i class="far fa-calendar-alt"></i>
                    Joined
                    <span id="joined-date">${getFormattedDate(data.created_at)}</span>
                </p>
            </div>
            <a href="${data.html_url}" target="_blank">View Profile</a>
        </div>
    `;
}

// Render user statistics: followers, following, public repos
function renderStats(data) {
    return `
        <div class="stat">
            <i class="fas fa-users"></i> ${data.followers} followers
        </div>
        <div class="stat">
            <i class="fas fa-user-friends"></i> ${data.following} following
        </div>
        <div class="stat">
            <i class="fas fa-code-branch"></i> ${data.public_repos} repositories
        </div>
    `;
}

// Render company, blog, and twitter info
function renderAdditionalInfo(data) {
    return `
        <div class="info-item">
            <i class="fas fa-building"></i> ${data.company || 'Not specified'}
        </div>
        <div class="info-item">
            <i class="fas fa-link"></i>
            <a target="_blank" href="${getBlogHref(data.blog)}">${getFormattedBlog(data.blog) || 'Not existed'}</a>
        </div>
        <div class="info-item">
            <i class="fab fa-twitter"></i>
            <a target="_blank" href="${data.twitter_username ? 'https://twitter.com/' + data.twitter_username : '#'}">
                ${data.twitter_username ? '@' + data.twitter_username : 'Not existed'}
            </a>
        </div>
    `;
}

// Render the latest 6 repositories
function renderRepos(repos) {
    if (!repos.length) return `<div class="empty-state">No repositories found</div>`;
    
    const container = document.createElement('div');

    repos.forEach(repo => {
        const repoEl = document.createElement('div');
        repoEl.classList.add('repo');
        repoEl.innerHTML = `
            <a href="${repo.html_url}" target="_blank" class="repo-name">
                <i class="fas fa-code-branch"></i>${repo.name}
            </a>
            <p class="repo-description">${repo.description || 'No description available'}</p>
            <div class="repo-meta">
                <div class="repo-meta-item">
                    <i class="fas fa-circle"></i> ${repo.language || 'Unknown'}
                </div>
                <div class="repo-meta-item">
                    <i class="fas fa-star"></i> ${repo.stargazers_count}
                </div>
                <div class="repo-meta-item">
                    <i class="fas fa-code-fork"></i> ${repo.forks_count}
                </div>
                <div class="repo-meta-item">
                    <i class="fas fa-history"></i> ${getFormattedDate(repo.updated_at)}
                </div>
            </div>
        `;
        container.append(repoEl);
    });

    return container.innerHTML;
}

// Format date to readable format like "Jul 16, 2025"
function getFormattedDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Ensure blog URL is correctly formatted with https
function getBlogHref(blog) {
    if (!blog) return '#';
    return /^https?/.test(blog) ? blog : `https://${blog}`;
}

function getFormattedBlog(data){
    return data?data.replace(/(https?:\/\/)?www./,'') : "";
}

// Fetch the latest 6 repositories sorted by updated date
async function fetchRepos(data) {
    try {
        const res = await fetch(`${data.repos_url}?sort=updated&per_page=6`);
        const reposData = await res.json();
        return reposData;
    } catch (error) {
        throw new Error(`Error fetching repos: ${error.message}`);
    }
}
