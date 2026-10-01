export function getHealthDotColor(lastCommitAt: string | null): 'green' | 'yellow' | 'red' {
  if (!lastCommitAt) return 'red'
  const days = (Date.now() - new Date(lastCommitAt).getTime()) / (1000 * 60 * 60 * 24)
  if (days <= 14) return 'green'
  if (days <= 60) return 'yellow'
  return 'red'
}

export function getTimeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function extractOwnerRepo(url: string): [string, string] {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/)
  if (!match) throw new Error('Invalid GitHub URL')
  return [match[1], match[2].replace(/\.git$/, '')]
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}