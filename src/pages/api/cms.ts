import type { APIRoute } from 'astro';
import { getSession } from 'auth-astro/server';
import { saveFileToGitHub, listFilesFromGitHub, deleteFileFromGitHub, getFileFromGitHub } from '../../utils/github';

export const GET: APIRoute = async ({ request, url }) => {
  const session = await getSession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const action = url.searchParams.get('action');
  const path = url.searchParams.get('path');

  if (action === 'list' && path) {
    const files = await listFilesFromGitHub(path);
    return new Response(JSON.stringify(files), { status: 200 });
  }

  if (action === 'get' && path) {
    const file = await getFileFromGitHub(path);
    if (file) {
      return new Response(JSON.stringify(file), { status: 200 });
    }
    return new Response(JSON.stringify({ error: 'File not found' }), { status: 404 });
  }

  return new Response(JSON.stringify({ status: 'ok' }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  const session = await getSession(request);

  // Authorization check
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data, content, filename, sha } = body;

    if (!content || !filename) {
      return new Response(JSON.stringify({ error: 'Missing content or filename' }), { status: 400 });
    }

    const path = filename;
    const message = `cms: ${sha ? 'update' : 'create'} ${type} - ${data.title}`;

    // Pass sha if it exists to support updates/concurrency check
    const success = await saveFileToGitHub(path, content, message, sha);

    if (success) {
      return new Response(JSON.stringify({ success: true, message: 'Saved to GitHub' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to save to GitHub' }), { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}

export const DELETE: APIRoute = async ({ request }) => {
  const session = await getSession(request);
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { path, sha } = body;

    if (!path || !sha) {
      return new Response(JSON.stringify({ error: 'Missing path or sha' }), { status: 400 });
    }

    const message = `cms: delete ${path}`;
    const success = await deleteFileFromGitHub(path, sha, message);

    if (success) {
      return new Response(JSON.stringify({ success: true, message: 'Deleted from GitHub' }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: 'Failed to delete from GitHub' }), { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
