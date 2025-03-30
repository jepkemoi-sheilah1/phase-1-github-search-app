document.addEventListener('DOMContentLoaded', () => {
    let form = document.getElementById('github-form');
    let resultsDiv = document.getElementById('results');
    let searchType = 'users'; // Variable to toggle between searching users and repositories
    
    // Create a button to toggle search type
    let toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'Search Repos';
    form.appendChild(toggleBtn);
    
    // Event listener to toggle search type when button is clicked
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchType = searchType === 'users' ? 'repositories' : 'users';
        toggleBtn.textContent = searchType === 'users' ? 'Search Repos' : 'Search Users';
    });

    // Event listener for the form submission
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let search = document.getElementById('search').value.trim(); // Get the search input and trim spaces
        if (!search) return; // Prevent empty searches
        resultsDiv.innerHTML = '<p>Loading...</p>'; // Show loading message
        
        // Determine the correct API URL based on search type
        let apiUrl = searchType === 'users'
            ? `https://api.github.com/search/users?q=${search}`
            : `https://api.github.com/search/repositories?q=${search}`;
        
        // Fetch data from GitHub API
        fetch(apiUrl, { 
            headers: { 
                'Accept': 'application/vnd.github.v3+json'
                        }
        
        })
            .then(response => response.json())
            .then(data => {
                resultsDiv.innerHTML = ''; // Clear results before displaying new ones
                
                if (searchType === 'users') {
                    // Display user search results
                    data.items.forEach(user => {
                        let userDiv = document.createElement('div');
                        userDiv.innerHTML = `
                            <div>
                                <a href="${user.html_url}" target="_blank">
                                    <img src="${user.avatar_url}" width="50" />
                                    <p>${user.login}</p>
                                </a>
                                <button data-username="${user.login}">View Repos</button>
                            </div>`;
                        resultsDiv.appendChild(userDiv);
                    });
                    
                    // Attach event listeners to 'View Repos' buttons
                    document.querySelectorAll('button[data-username]').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            fetchUserRepos(e.target.dataset.username);
                        });
                    });
                } else {
                    // Display repository search results
                    data.items.forEach(repo => {
                        let repoDiv = document.createElement('div');
                        repoDiv.innerHTML = `
                            <div>
                                <a href="${repo.html_url}" target="_blank">
                                    <p>${repo.full_name}</p>
                                </a>
                            </div>`;
                        resultsDiv.appendChild(repoDiv);
                    });
                }
            })
            .catch(error => console.error('Error:', error)); // Handle errors
    });
    
    // Function to fetch and display repositories for a selected user
    function fetchUserRepos(username) {
        fetch(`https://api.github.com/users/${username}/repos`)
            .then(response => response.json())
            .then(repos => {
                let repoList = '<h3>Repositories:</h3>';
                repos.forEach(repo => {
                    repoList += `<p><a href="${repo.html_url}" target="_blank">${repo.name}</a></p>`;
                });
                document.getElementById('results').innerHTML += repoList; // Append repo list to results
            })
            .catch(error => console.error('Error fetching repos:', error));
    }
})
