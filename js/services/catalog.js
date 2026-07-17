import { AI_CATEGORY } from "../config.js";

const siteDefinitions = [
  { id: "google", name: "Google", category: "Pesquisa", searchUrl: "https://www.google.com/search?q={query}", url: "https://www.google.com/", icon: "https://cdn.simpleicons.org/google" },
  { id: "duckduckgo", name: "DuckDuckGo", category: "Pesquisa", searchUrl: "https://duckduckgo.com/?q={query}", url: "https://duckduckgo.com/", icon: "https://cdn.simpleicons.org/duckduckgo" },
  { id: "bing", name: "Bing", category: "Pesquisa", searchUrl: "https://www.bing.com/search?q={query}", url: "https://www.bing.com/", icon: "https://cdn.simpleicons.org/microsoftbing/258ffa" },
  { id: "brave", name: "Brave Search", category: "Pesquisa", searchUrl: "https://search.brave.com/search?q={query}", url: "https://search.brave.com/", icon: "https://cdn.simpleicons.org/brave/fb542b" },
  { id: "wikipedia", name: "Wikipedia", category: "Pesquisa", searchUrl: "https://pt.wikipedia.org/w/index.php?search={query}", url: "https://pt.wikipedia.org/", icon: "https://cdn.simpleicons.org/wikipedia/ffffff" },
  { id: "chatgpt", name: "ChatGPT", category: "Inteligência Artificial", searchUrl: "https://chatgpt.com/?q={query}", url: "https://chatgpt.com/", icon: "https://cdn.simpleicons.org/openai/ffffff" },
  { id: "claude", name: "Claude", category: "Inteligência Artificial", searchUrl: "https://claude.ai/new?q={query}", url: "https://claude.ai/", icon: "https://cdn.simpleicons.org/claude/d97757" },
  { id: "gemini", name: "Gemini", category: "Inteligência Artificial", searchUrl: "https://gemini.google.com/app?q={query}", url: "https://gemini.google.com/", icon: "https://cdn.simpleicons.org/googlegemini/8e75ff" },
  { id: "copilot", name: "Microsoft Copilot", category: "Inteligência Artificial", searchUrl: "https://copilot.microsoft.com/?q={query}", url: "https://copilot.microsoft.com/", icon: "https://cdn.simpleicons.org/microsoftcopilot/ffffff" },
  { id: "perplexity", name: "Perplexity", category: "Inteligência Artificial", searchUrl: "https://www.perplexity.ai/search?q={query}", url: "https://www.perplexity.ai/", icon: "https://cdn.simpleicons.org/perplexity/20b8cd" },
  { id: "grok", name: "Grok", category: "Inteligência Artificial", searchUrl: "https://grok.com/?q={query}", url: "https://grok.com/", icon: "https://cdn.simpleicons.org/x/ffffff" },
  { id: "deepseek", name: "DeepSeek", category: "Inteligência Artificial", url: "https://chat.deepseek.com/", icon: "https://cdn.simpleicons.org/deepseek/4d6bff" },
  { id: "mistral", name: "Le Chat", category: "Inteligência Artificial", url: "https://chat.mistral.ai/chat", icon: "https://cdn.simpleicons.org/mistralai/ff7000" },
  { id: "poe", name: "Poe", category: "Inteligência Artificial", url: "https://poe.com/", icon: "https://cdn.simpleicons.org/poe/ffffff" },
  { id: "huggingchat", name: "HuggingChat", category: "Inteligência Artificial", url: "https://huggingface.co/chat/", icon: "https://cdn.simpleicons.org/huggingface/ffd21e" },
  { id: "you", name: "You.com", category: "Inteligência Artificial", searchUrl: "https://you.com/search?q={query}", url: "https://you.com/", icon: "https://cdn.simpleicons.org/youtubemusic/7b61ff" },
  { id: "metaai", name: "Meta AI", category: "Inteligência Artificial", url: "https://www.meta.ai/", icon: "https://cdn.simpleicons.org/meta/0866ff" },
  { id: "characterai", name: "Character.AI", category: "Inteligência Artificial", url: "https://character.ai/", icon: "https://cdn.simpleicons.org/characterai/ffffff" },
  { id: "phind", name: "Phind", category: "Inteligência Artificial", searchUrl: "https://www.phind.com/search?q={query}", url: "https://www.phind.com/", icon: "https://cdn.simpleicons.org/semanticweb/6c5ce7" },
  { id: "blackbox", name: "Blackbox AI", category: "Inteligência Artificial", url: "https://www.blackbox.ai/", icon: "https://cdn.simpleicons.org/codeium/ffffff" },
  { id: "midjourney", name: "Midjourney", category: "Inteligência Artificial", url: "https://www.midjourney.com/", icon: "https://cdn.simpleicons.org/midjourney/ffffff" },
  { id: "ideogram", name: "Ideogram", category: "Inteligência Artificial", url: "https://ideogram.ai/", icon: "https://cdn.simpleicons.org/ideogram/ffffff" },
  { id: "leonardo", name: "Leonardo AI", category: "Inteligência Artificial", url: "https://app.leonardo.ai/", icon: "https://cdn.simpleicons.org/affinitydesigner/8d5cff" },
  { id: "firefly", name: "Adobe Firefly", category: "Inteligência Artificial", url: "https://firefly.adobe.com/", icon: "https://cdn.simpleicons.org/adobe/ff0000" },
  { id: "runway", name: "Runway", category: "Inteligência Artificial", url: "https://app.runwayml.com/", icon: "https://cdn.simpleicons.org/runway/ffffff" },
  { id: "suno", name: "Suno", category: "Inteligência Artificial", url: "https://suno.com/create", icon: "https://cdn.simpleicons.org/suno/ffffff" },
  { id: "elevenlabs", name: "ElevenLabs", category: "Inteligência Artificial", url: "https://elevenlabs.io/app", icon: "https://cdn.simpleicons.org/elevenlabs/ffffff" },
  { id: "notebooklm", name: "NotebookLM", category: "Inteligência Artificial", url: "https://notebooklm.google.com/", icon: "https://cdn.simpleicons.org/google/4285f4" },
  { id: "gamma", name: "Gamma", category: "Inteligência Artificial", url: "https://gamma.app/", icon: "https://cdn.simpleicons.org/g/9b6cff" },
  { id: "trello", name: "Trello", category: "Projetos", searchUrl: "https://trello.com/search?q={query}", url: "https://trello.com/", icon: "https://cdn.simpleicons.org/trello/0c66e4" },
  { id: "asana", name: "Asana", category: "Projetos", url: "https://app.asana.com/", icon: "https://cdn.simpleicons.org/asana/f06a6a" },
  { id: "jira", name: "Jira", category: "Projetos", url: "https://www.atlassian.com/software/jira", icon: "https://cdn.simpleicons.org/jira/0052cc" },
  { id: "linear", name: "Linear", category: "Projetos", url: "https://linear.app/", icon: "https://cdn.simpleicons.org/linear/ffffff" },
  { id: "clickup", name: "ClickUp", category: "Projetos", url: "https://app.clickup.com/", icon: "https://cdn.simpleicons.org/clickup/7b68ee" },
  { id: "github", name: "GitHub", category: "Desenvolvimento", searchUrl: "https://github.com/search?q={query}", url: "https://github.com/", icon: "https://cdn.simpleicons.org/github/ffffff" },
  { id: "gitlab", name: "GitLab", category: "Desenvolvimento", searchUrl: "https://gitlab.com/search?search={query}", url: "https://gitlab.com/", icon: "https://cdn.simpleicons.org/gitlab/fc6d26" },
  { id: "stackoverflow", name: "Stack Overflow", category: "Desenvolvimento", searchUrl: "https://stackoverflow.com/search?q={query}", url: "https://stackoverflow.com/", icon: "https://cdn.simpleicons.org/stackoverflow/f58025" },
  { id: "mdn", name: "MDN Web Docs", category: "Desenvolvimento", searchUrl: "https://developer.mozilla.org/pt-BR/search?q={query}", url: "https://developer.mozilla.org/", icon: "https://cdn.simpleicons.org/mdnwebdocs/ffffff" },
  { id: "dockerhub", name: "Docker Hub", category: "Desenvolvimento", searchUrl: "https://hub.docker.com/search?q={query}", url: "https://hub.docker.com/", icon: "https://cdn.simpleicons.org/docker/2496ed" },
  { id: "pypi", name: "PyPI", category: "Desenvolvimento", searchUrl: "https://pypi.org/search/?q={query}", url: "https://pypi.org/", icon: "https://cdn.simpleicons.org/pypi/3775a9" },
  { id: "devdocs", name: "DevDocs", category: "Desenvolvimento", searchUrl: "https://devdocs.io/#q={query}", url: "https://devdocs.io/", icon: "https://cdn.simpleicons.org/readthedocs/8ca1af" },
  { id: "codepen", name: "CodePen", category: "Desenvolvimento", searchUrl: "https://codepen.io/search/pens?q={query}", url: "https://codepen.io/", icon: "https://cdn.simpleicons.org/codepen/ffffff" },
  { id: "vercel", name: "Vercel", category: "Desenvolvimento", url: "https://vercel.com/dashboard", icon: "https://cdn.simpleicons.org/vercel/ffffff" },
  { id: "netlify", name: "Netlify", category: "Desenvolvimento", url: "https://app.netlify.com/", icon: "https://cdn.simpleicons.org/netlify/00c7b7" },
  { id: "youtube", name: "YouTube", category: "Mídia", searchUrl: "https://www.youtube.com/results?search_query={query}", url: "https://www.youtube.com/", icon: "https://cdn.simpleicons.org/youtube/ff0033" },
  { id: "spotify", name: "Spotify", category: "Mídia", searchUrl: "https://open.spotify.com/search/{query}", url: "https://open.spotify.com/", icon: "https://cdn.simpleicons.org/spotify/1ed760" },
  { id: "reddit", name: "Reddit", category: "Mídia", searchUrl: "https://www.reddit.com/search/?q={query}", url: "https://www.reddit.com/", icon: "https://cdn.simpleicons.org/reddit/ff4500" },
  { id: "medium", name: "Medium", category: "Mídia", searchUrl: "https://medium.com/search?q={query}", url: "https://medium.com/", icon: "https://cdn.simpleicons.org/medium/ffffff" },
  { id: "discord", name: "Discord", category: "Comunicação", url: "https://discord.com/", icon: "https://cdn.simpleicons.org/discord/5865f2" },
  { id: "slack", name: "Slack", category: "Comunicação", url: "https://app.slack.com/", icon: "https://cdn.simpleicons.org/slack/4a154b" },
  { id: "teams", name: "Microsoft Teams", category: "Comunicação", url: "https://teams.microsoft.com/", icon: "https://cdn.simpleicons.org/microsoftteams/6264a7" },
  { id: "gmail", name: "Gmail", category: "Comunicação", searchUrl: "https://mail.google.com/mail/u/0/#search/{query}", url: "https://mail.google.com/", icon: "https://www.gstatic.com/images/branding/product/1x/gmail_48dp.png" },
  { id: "maps", name: "Google Maps", category: "Produtividade", searchUrl: "https://www.google.com/maps/search/{query}", url: "https://www.google.com/maps/", icon: "https://www.gstatic.com/images/branding/product/1x/maps_48dp.png" },
  { id: "calendar", name: "Google Calendar", category: "Produtividade", searchUrl: "https://calendar.google.com/calendar/u/0/r/search?q={query}", url: "https://calendar.google.com/", icon: "https://www.gstatic.com/images/branding/product/1x/calendar_48dp.png" },
  { id: "drive", name: "Google Drive", category: "Produtividade", searchUrl: "https://drive.google.com/drive/u/0/my-drive?q={query}", url: "https://drive.google.com/", icon: "https://cdn.simpleicons.org/googledrive/4285f4" },
  { id: "notion", name: "Notion", category: "Produtividade", url: "https://www.notion.so/", icon: "https://cdn.simpleicons.org/notion/ffffff" },
  { id: "figma", name: "Figma", category: "Produtividade", url: "https://www.figma.com/files/", icon: "https://cdn.simpleicons.org/figma/f24e1e" },
  { id: "canva", name: "Canva", category: "Produtividade", url: "https://www.canva.com/", icon: "https://cdn.simpleicons.org/canva/00c4cc" },
  { id: "miro", name: "Miro", category: "Produtividade", url: "https://miro.com/app/dashboard/", icon: "https://cdn.simpleicons.org/miro/ffd02f" },
  { id: "dropbox", name: "Dropbox", category: "Produtividade", url: "https://www.dropbox.com/home", icon: "https://cdn.simpleicons.org/dropbox/0061ff" },
  { id: "npm", name: "NPM", category: "Desenvolvimento", searchUrl: "https://www.npmjs.com/search?q={query}", url: "https://www.npmjs.com/", icon: "https://cdn.simpleicons.org/npm/cb3837" },
  { id: "packagist", name: "Packagist", category: "Desenvolvimento", searchUrl: "https://packagist.org/search/?q={query}", url: "https://packagist.org/", icon: "https://packagist.org/img/logo-small.png" },
  { id: "bitbucket", name: "Bitbucket", category: "Desenvolvimento", url: "https://bitbucket.org/", icon: "https://cdn.simpleicons.org/bitbucket/0052cc" }
];

const authSiteIds = new Set([
  "claude", "gemini", "grok", "deepseek", "mistral", "poe", "huggingchat", "metaai", "characterai", "blackbox", "midjourney", "ideogram", "leonardo", "firefly", "runway", "suno", "elevenlabs", "notebooklm", "gamma",
  "trello", "asana", "jira", "linear", "clickup", "vercel", "netlify", "discord", "slack", "teams", "gmail", "calendar", "drive", "notion", "figma", "canva", "miro", "dropbox"
]);
siteDefinitions.forEach((site) => {
  site.auth = authSiteIds.has(site.id);
  if (site.category === AI_CATEGORY) delete site.searchUrl;
  site.shortcut = site.category !== AI_CATEGORY && !site.searchUrl;
});

export function createDefaultSites() {
  return siteDefinitions.map((site) => ({ ...site }));
}
