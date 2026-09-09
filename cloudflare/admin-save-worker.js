const editableFiles = {
  news: { fileName: "news-data.js", globalName: "newsItems" },
  events: { fileName: "events-data.js", globalName: "clubEvents" },
  sponsors: { fileName: "sponsors-data.js", globalName: "sponsors" },
  membership: { fileName: "membership-data.js", globalName: "membershipPrices" },
  matches: { fileName: "matches-data.js", globalName: "matches" },
  board: { fileName: "vorstand-data.js", globalName: "vorstandMembers" },
};

const editableAssets = {
  news: { image: "assets/news" },
  sponsors: { logo: "assets/sponsors" },
  board: { image: "assets/vorstand" },
};

const allowedImageTypes = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
  "image/avif": ["avif"],
};

const defaultAllowedOrigins = [
  "https://patrikdobcsanyi.github.io",
  "https://tceschen-mauren.li",
  "https://www.tceschen-mauren.li",
  "http://127.0.0.1:8001",
  "http://127.0.0.1:8002",
  "http://localhost:8001",
  "http://localhost:8002",
];

const getCorsHeaders = (request, env) => {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = [
    ...defaultAllowedOrigins,
    ...(env.ADMIN_ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean),
  ];

  if (!allowedOrigins.includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, CF-Access-Jwt-Assertion",
    "Vary": "Origin",
  };
};

const jsonResponse = (request, env, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...getCorsHeaders(request, env),
  },
});

const encodeBase64 = (value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

const getActorEmail = async (request, ctx) => {
  if (ctx.access) {
    const identity = await ctx.access.getIdentity();
    if (identity?.email) return identity.email;
  }

  return request.headers.get("cf-access-authenticated-user-email") || "";
};

const assertAllowedEmail = (email, env) => {
  const allowedEmails = (env.ALLOWED_ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length === 0) return;
  if (!allowedEmails.includes(email.toLowerCase())) {
    throw new Response(`Email ${email} is not allowed to save website content. Add this exact email to ALLOWED_ADMIN_EMAILS and redeploy the Worker.`, { status: 403 });
  }
};

const assertAdminAccess = ({ actor, adminPassword }, env) => {
  if (actor) {
    assertAllowedEmail(actor, env);
    return actor;
  }

  if (env.ADMIN_PASSWORD && adminPassword === env.ADMIN_PASSWORD) {
    return "Admin Passwort";
  }

  throw new Response("Admin login failed. Passwort falsch oder Cloudflare Access Login fehlt.", { status: 403 });
};

const parseDataAssignment = (content, globalName) => {
  const expression = new RegExp(`^window\\.${globalName}\\s*=\\s*([\\s\\S]*);\\s*$`);
  const match = content.match(expression);

  if (!match) {
    throw new Response(`Content must assign window.${globalName}.`, { status: 400 });
  }

  try {
    JSON.parse(match[1]);
  } catch (error) {
    throw new Response(`Content for window.${globalName} is not valid JSON.`, { status: 400 });
  }
};

const githubRequest = async (env, path, options = {}) => {
  const { query = "", allow404 = false, ...fetchOptions } = options;
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}${query}`;

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "tcem-admin-worker",
      "X-GitHub-Api-Version": "2022-11-28",
      ...fetchOptions.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (allow404 && response.status === 404) return null;
    throw new Response(payload.message || "GitHub request failed.", { status: response.status });
  }

  return payload;
};

const sanitizeFileName = (fileName) => {
  const parts = String(fileName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(".");
  const extension = parts.length > 1 ? parts.pop() : "";
  const baseName = parts.join(".") || "bild";
  const cleanBase = baseName
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || "bild";
  const cleanExtension = extension.replace(/[^a-z0-9]/g, "").slice(0, 8);

  return cleanExtension ? `${cleanBase}.${cleanExtension}` : cleanBase;
};

const assertValidImage = ({ fileName, contentType, contentBase64 }) => {
  const safeName = sanitizeFileName(fileName);
  const extension = safeName.split(".").pop();
  const normalizedContentType = allowedImageTypes[contentType]
    ? contentType
    : Object.keys(allowedImageTypes).find((type) => allowedImageTypes[type].includes(extension));
  const allowedExtensions = allowedImageTypes[normalizedContentType] || [];

  if (!allowedExtensions.includes(extension)) {
    throw new Response("Nur JPG, PNG, WebP, GIF und AVIF Bilder sind erlaubt.", { status: 400 });
  }

  if (!contentBase64 || !/^[A-Za-z0-9+/]+={0,2}$/.test(contentBase64)) {
    throw new Response("Bilddaten fehlen oder sind ungueltig.", { status: 400 });
  }

  const rawSize = Math.floor((contentBase64.length * 3) / 4);
  if (rawSize > 6 * 1024 * 1024) {
    throw new Response("Das Bild ist zu gross. Bitte maximal 6 MB hochladen.", { status: 400 });
  }

  return safeName;
};

const saveToGitHub = async ({ type, fileName, content, actor }, env) => {
  const config = editableFiles[type];

  if (!config || config.fileName !== fileName) {
    throw new Response("This file is not editable through the admin.", { status: 400 });
  }

  parseDataAssignment(content, config.globalName);

  const branch = env.GITHUB_BRANCH || "main";
  const path = `js/${fileName}`;
  const currentFile = await githubRequest(env, path, {
    method: "GET",
    query: `?ref=${encodeURIComponent(branch)}`,
  });

  const update = await githubRequest(env, path, {
    method: "PUT",
    body: JSON.stringify({
      message: `chore(admin): update ${fileName}`,
      content: encodeBase64(content),
      sha: currentFile.sha,
      branch,
      committer: {
        name: "TCEM Admin",
        email: env.GITHUB_COMMITTER_EMAIL || "admin@tceschen-mauren.li",
      },
    }),
  });

  return {
    actor,
    fileName,
    path,
    commitSha: update.commit?.sha,
    commitUrl: update.commit?.html_url,
  };
};

const saveAssetToGitHub = async ({ type, fieldKey, directory, fileName, contentType, contentBase64, actor }, env) => {
  const allowedDirectory = editableAssets[type]?.[fieldKey];

  if (!allowedDirectory || allowedDirectory !== directory) {
    throw new Response("Dieser Bildordner ist nicht fuer den Admin freigegeben.", { status: 400 });
  }

  const branch = env.GITHUB_BRANCH || "main";
  const safeName = `${Date.now()}-${assertValidImage({ fileName, contentType, contentBase64 })}`;
  const path = `${directory}/${safeName}`;
  const currentFile = await githubRequest(env, path, {
    method: "GET",
    query: `?ref=${encodeURIComponent(branch)}`,
    allow404: true,
  });

  const update = await githubRequest(env, path, {
    method: "PUT",
    body: JSON.stringify({
      message: `chore(admin): upload ${safeName}`,
      content: contentBase64,
      ...(currentFile?.sha ? { sha: currentFile.sha } : {}),
      branch,
      committer: {
        name: "TCEM Admin",
        email: env.GITHUB_COMMITTER_EMAIL || "admin@tceschen-mauren.li",
      },
    }),
  });

  return {
    actor,
    fileName: safeName,
    path,
    commitSha: update.commit?.sha,
    commitUrl: update.commit?.html_url,
  };
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request, env),
      });
    }

    const isSaveRequest = url.pathname === "/api/admin/save";
    const isUploadRequest = url.pathname === "/api/admin/upload";
    const isVerifyRequest = url.pathname === "/api/admin/verify";

    if (!isSaveRequest && !isUploadRequest && !isVerifyRequest) {
      return jsonResponse(request, env, { error: "Not found." }, 404);
    }

    if (request.method !== "POST") {
      return jsonResponse(request, env, { error: "Method not allowed." }, 405);
    }

    try {
      const body = JSON.parse(await request.text());
      const actor = assertAdminAccess({
        actor: await getActorEmail(request, ctx),
        adminPassword: body.adminPassword,
      }, env);

      if (isVerifyRequest) {
        return jsonResponse(request, env, { actor });
      }

      if (!env.GITHUB_OWNER || !env.GITHUB_REPO || !env.GITHUB_TOKEN) {
        return jsonResponse(request, env, { error: "Worker GitHub environment is incomplete." }, 500);
      }

      const result = isUploadRequest
        ? await saveAssetToGitHub({ ...body, actor }, env)
        : await saveToGitHub({ ...body, actor }, env);
      return jsonResponse(request, env, result);
    } catch (error) {
      if (error instanceof Response) {
        return jsonResponse(request, env, { error: await error.text() }, error.status);
      }

      return jsonResponse(request, env, { error: error.message || "Unexpected save error." }, 500);
    }
  },
};
