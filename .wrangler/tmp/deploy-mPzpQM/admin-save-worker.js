var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// cloudflare/admin-save-worker.js
var editableFiles = {
  news: { fileName: "news-data.js", globalName: "newsItems" },
  events: { fileName: "events-data.js", globalName: "clubEvents" },
  sponsors: { fileName: "sponsors-data.js", globalName: "sponsors" },
  membership: { fileName: "membership-data.js", globalName: "membershipPrices" },
  matches: { fileName: "matches-data.js", globalName: "matches" },
  board: { fileName: "vorstand-data.js", globalName: "vorstandMembers" }
};
var defaultAllowedOrigins = [
  "https://patrikdobcsanyi.github.io",
  "https://tceschen-mauren.li",
  "https://www.tceschen-mauren.li",
  "http://127.0.0.1:8001",
  "http://127.0.0.1:8002",
  "http://localhost:8001",
  "http://localhost:8002"
];
var getCorsHeaders = /* @__PURE__ */ __name((request, env) => {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = [
    ...defaultAllowedOrigins,
    ...(env.ADMIN_ALLOWED_ORIGINS || "").split(",").map((item) => item.trim()).filter(Boolean)
  ];
  if (!allowedOrigins.includes(origin)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, CF-Access-Jwt-Assertion",
    "Vary": "Origin"
  };
}, "getCorsHeaders");
var jsonResponse = /* @__PURE__ */ __name((request, env, body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...getCorsHeaders(request, env)
  }
}), "jsonResponse");
var encodeBase64 = /* @__PURE__ */ __name((value) => {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}, "encodeBase64");
var getActorEmail = /* @__PURE__ */ __name(async (request, ctx) => {
  if (ctx.access) {
    const identity = await ctx.access.getIdentity();
    if (identity?.email) return identity.email;
  }
  return request.headers.get("cf-access-authenticated-user-email") || "";
}, "getActorEmail");
var assertAllowedEmail = /* @__PURE__ */ __name((email, env) => {
  const allowedEmails = (env.ALLOWED_ADMIN_EMAILS || "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (allowedEmails.length === 0) return;
  if (!allowedEmails.includes(email.toLowerCase())) {
    throw new Response("Email is not allowed to save website content.", { status: 403 });
  }
}, "assertAllowedEmail");
var parseDataAssignment = /* @__PURE__ */ __name((content, globalName) => {
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
}, "parseDataAssignment");
var githubRequest = /* @__PURE__ */ __name(async (env, path, options = {}) => {
  const owner = env.GITHUB_OWNER;
  const repo = env.GITHUB_REPO;
  const branch = env.GITHUB_BRANCH || "main";
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}${options.query || ""}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${env.GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "tcem-admin-worker",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Response(payload.message || "GitHub request failed.", { status: response.status });
  }
  return payload;
}, "githubRequest");
var saveToGitHub = /* @__PURE__ */ __name(async ({ type, fileName, content, actor }, env) => {
  const config = editableFiles[type];
  if (!config || config.fileName !== fileName) {
    throw new Response("This file is not editable through the admin.", { status: 400 });
  }
  parseDataAssignment(content, config.globalName);
  const branch = env.GITHUB_BRANCH || "main";
  const path = `js/${fileName}`;
  const currentFile = await githubRequest(env, path, {
    method: "GET",
    query: `?ref=${encodeURIComponent(branch)}`
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
        email: env.GITHUB_COMMITTER_EMAIL || "admin@tceschen-mauren.li"
      }
    })
  });
  return {
    actor,
    fileName,
    path,
    commitSha: update.commit?.sha,
    commitUrl: update.commit?.html_url
  };
}, "saveToGitHub");
var admin_save_worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(request, env)
      });
    }
    if (url.pathname !== "/api/admin/save") {
      return jsonResponse(request, env, { error: "Not found." }, 404);
    }
    if (request.method !== "POST") {
      return jsonResponse(request, env, { error: "Method not allowed." }, 405);
    }
    try {
      const actor = await getActorEmail(request, ctx);
      if (!actor) {
        return jsonResponse(request, env, { error: "Cloudflare Access login required." }, 403);
      }
      assertAllowedEmail(actor, env);
      if (!env.GITHUB_OWNER || !env.GITHUB_REPO || !env.GITHUB_TOKEN) {
        return jsonResponse(request, env, { error: "Worker GitHub environment is incomplete." }, 500);
      }
      const body = JSON.parse(await request.text());
      const result = await saveToGitHub({ ...body, actor }, env);
      return jsonResponse(request, env, result);
    } catch (error) {
      if (error instanceof Response) {
        return jsonResponse(request, env, { error: await error.text() }, error.status);
      }
      return jsonResponse(request, env, { error: error.message || "Unexpected save error." }, 500);
    }
  }
};
export {
  admin_save_worker_default as default
};
//# sourceMappingURL=admin-save-worker.js.map
