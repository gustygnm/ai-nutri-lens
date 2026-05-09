// This file is overwritten by Docker at runtime in Cloud Run.
// In sandbox environments, process.env is provided by the sandbox natively.
window.process = window.process || {};
window.process.env = window.process.env || {};
