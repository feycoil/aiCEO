/**
 * anthropic-client.js — factory centralisée pour le SDK Anthropic.
 *
 * Gère HTTPS_PROXY / https_proxy via https-proxy-agent (node-fetch du SDK
 * respecte nativement l'option `httpAgent`). Utilisé par llm.js et drafts.js
 * pour éviter la duplication de la config proxy.
 */

function createAnthropicClient() {
  const Anthropic = require("@anthropic-ai/sdk").default || require("@anthropic-ai/sdk");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
  const opts = { apiKey };

  if (proxyUrl) {
    try {
      const { HttpsProxyAgent } = require("https-proxy-agent");
      opts.httpAgent = new HttpsProxyAgent(proxyUrl);
      if (!process.env.AICEO_QUIET && !global.__AICEO_PROXY_LOGGED) {
        console.log(`[llm] proxy actif : ${proxyUrl}`);
        global.__AICEO_PROXY_LOGGED = true;
      }
    } catch (e) {
      console.warn("[llm] proxy demandé mais https-proxy-agent indisponible :", e.message);
    }
  }

  return new Anthropic(opts);
}

module.exports = { createAnthropicClient };
