import { NextRequest, NextResponse } from 'next/server';

function extractRepoPath(url: string): string | null {
  const cleaned = url.replace(/\/$/, '').replace(/\.git$/, '');
  const match = cleaned.match(/github\.com\/([^/]+\/[^/]+)/);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const { repoUrl } = await request.json();

    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json({ error: 'repoUrl is required.' }, { status: 400 });
    }

    const repoPath = extractRepoPath(repoUrl);
    if (!repoPath) {
      return NextResponse.json({ error: 'Invalid GitHub URL.' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'personal-portfolio',
    };
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const [repoRes, topicsRes] = await Promise.all([
      fetch(`https://api.github.com/repos/${repoPath}`, { headers }),
      fetch(`https://api.github.com/repos/${repoPath}/topics`, { headers }),
    ]);

    if (!repoRes.ok) {
      const status = repoRes.status;
      if (status === 404) return NextResponse.json({ error: 'Repository not found.' }, { status: 404 });
      if (status === 403) return NextResponse.json({ error: 'Rate limit exceeded. Configure GITHUB_TOKEN for higher limits.' }, { status: 429 });
      return NextResponse.json({ error: 'Failed to fetch repository.' }, { status: 502 });
    }

    const repo = await repoRes.json();
    let topics: string[] = [];
    if (topicsRes.ok) {
      const topicsData = await topicsRes.json();
      topics = topicsData.names || [];
    }

    return NextResponse.json({
      title: repo.name,
      description: repo.description || '',
      gitRepoData: {
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        language: repo.language || '',
        description: repo.description || '',
        topics,
        updatedAt: repo.updated_at || '',
      },
      githubUrl: repo.html_url,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
