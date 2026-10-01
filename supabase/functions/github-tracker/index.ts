import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

  const { data: projects } = await supabase
    .from('projects')
    .select('id, github_repo_url, last_commit_at, poster_id, title')
    .in('status', ['open', 'in_progress'])
    .not('github_repo_url', 'is', null)

  for (const project of projects ?? []) {
    const [owner, repo] = extractOwnerRepo(project.github_repo_url)
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, {
      headers: { Authorization: `Bearer ${Deno.env.get('GITHUB_TOKEN')}` }
    })
    const commits = await res.json()
    if (!commits[0]) continue

    const lastCommitAt = new Date(commits[0].commit.author.date)
    const daysSince = (Date.now() - lastCommitAt.getTime()) / (1000 * 60 * 60 * 24)

    await supabase.from('projects').update({
      last_commit_at: lastCommitAt.toISOString(),
      last_checked_at: new Date().toISOString()
    }).eq('id', project.id)

    if (daysSince > 90) {
      await supabase.from('projects').update({ status: 'archived' }).eq('id', project.id)
      await supabase.from('notifications').insert({
        user_id: project.poster_id,
        type: 'project_archived',
        message: `Your project "${project.title}" was archived after 90 days of inactivity.`, 
        ref_id: project.id
      })
    } else if (daysSince > 75) {
      await supabase.from('notifications').insert({
        user_id: project.poster_id,
        type: 'commit_inactivity_warning',
        message: `Your project "${project.title}" has had no commits for ${Math.floor(daysSince)} days. It will be archived after 90 days.`, 
        ref_id: project.id
      })
    }
  }

  return new Response('OK')
})

function extractOwnerRepo(url: string): [string, string] {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  return [match[1], match[2].replace(/\.git$/, '')]
}