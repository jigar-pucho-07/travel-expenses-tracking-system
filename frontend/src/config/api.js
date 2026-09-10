/**
 * Webhook URL configuration for all 6 PuchoAI workflows.
 *
 * MODE: Set IS_MOCK to false and provide real URLs for production.
 *       Set IS_MOCK to true (or leave URLs empty) for mock/demo mode.
 *
 * To get webhook URLs:
 *   1. Import each workflow JSON into Pucho AI Studio
 *   2. Open the workflow, go to the webhook trigger block
 *   3. Copy the "Live URL" and paste it here
 *   4. Ensure the workflow is Published/Active
 */

export const IS_MOCK = true;

export const WORKFLOW = {
  login:            { url: "",  name: "WF1 - Login" },
  create_trip:      { url: "",  name: "WF2 - Create Trip" },
  add_expense:      { url: "",  name: "WF3 - Add Expense" },
  process_receipt:  { url: "",  name: "WF4 - Process Receipt (Upload + OCR)" },
  trip_summary:     { url: "",  name: "WF5 - Trip Summary" },
  complete_trip:    { url: "",  name: "WF6 - Complete Trip" },
  list_trips:       { url: "",  name: "WF7 - List Trips" },
};

/**
 * Read webhook URLs from import.meta.env (Vite env vars)
 * Overrides any hardcoded URLs. Secure approach: never commit .env.
 *
 * Required .env entries (copy from .env.example):
 *   VITE_WF_LOGIN=https://studio.pucho.ai/webhooks/...
 *   VITE_WF_CREATE_TRIP=https://studio.pucho.ai/webhooks/...
 *   VITE_WF_ADD_EXPENSE=https://studio.pucho.ai/webhooks/...
 *   VITE_WF_PROCESS_RECEIPT=https://studio.pucho.ai/webhooks/...
 *   VITE_WF_TRIP_SUMMARY=https://studio.pucho.ai/webhooks/...
 *   VITE_WF_COMPLETE_TRIP=https://studio.pucho.ai/webhooks/...
 *   VITE_IS_MOCK=true
 *
 * NOTE: These are only webhook endpoint URLs — no credentials, no
 * API keys, no secrets. The credentials (Google Sheets OAuth, Drive
 * OAuth, Pucho model keys) live inside Pucho AI Studio connections.
 */
const ENV_MAP = {
  login:            'VITE_WF_LOGIN',
  create_trip:      'VITE_WF_CREATE_TRIP',
  add_expense:      'VITE_WF_ADD_EXPENSE',
  process_receipt:  'VITE_WF_PROCESS_RECEIPT',
  trip_summary:     'VITE_WF_TRIP_SUMMARY',
  complete_trip:    'VITE_WF_COMPLETE_TRIP',
  list_trips:       'VITE_WF_LIST_TRIPS',
};

export function loadWebhookUrls() {
  let hasAnyUrl = false;
  Object.keys(ENV_MAP).forEach((key) => {
    const envVal = import.meta.env[ENV_MAP[key]];
    if (envVal) {
      WORKFLOW[key].url = envVal;
      hasAnyUrl = true;
    }
  });
  const envMock = import.meta.env.VITE_IS_MOCK;
  if (envMock === 'false' || envMock === false) {
    // Force disable mock
    window.__TRAVEL_DISABLE_MOCK = true;
  }
  if (!hasAnyUrl) {
    console.info(
      '%c[Travel Tracker] %cMock mode active — no webhook URLs configured. %cSet VITE_WF_* in .env to enable real API calls.',
      'color:#8b5cf6;font-weight:bold', 'color:#f59e0b', 'color:#6B7280'
    );
  }
}

export function validateConfig() {
  const errors = [];
  if (!window.__TRAVEL_DISABLE_MOCK) return errors; // mock mode, skip
  Object.entries(WORKFLOW).forEach(([key, wf]) => {
    if (!wf.url) {
      errors.push(`${wf.name}: webhook URL not set`);
    }
  });
  return errors;
}