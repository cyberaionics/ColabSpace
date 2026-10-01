export async function fetchGitHubCommits(repoUrl: string) {
  const [owner, repo] = extractOwnerRepo(repoUrl)
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`)
  return res.json()
}