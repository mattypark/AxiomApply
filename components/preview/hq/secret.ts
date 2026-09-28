/**
 * The prototype's stand-in for HQ's secret path segment. Obviously fake on
 * purpose. The real one is a long random value that lives in server config,
 * never in the repo — and it is only the first lock (see
 * docs/DESIGN-AFTER-SUBMIT.md, "Access"): a sign-in gate still stands behind it.
 */
export const MOCK_HQ_CODE = "demo-not-a-real-code-7q2x";
