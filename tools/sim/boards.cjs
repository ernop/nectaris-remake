/* Built-in boards in the order tools/ai-research/run.cjs numbers them. */
"use strict";
const path = require("node:path");
const root = path.resolve(__dirname, "../..");
const boards = [require(path.join(root, "js/data-maps.js")), require(path.join(root, "js/data-advanced-maps.js")),
  require(path.join(root, "js/data-expansion-maps.js")), require(path.join(root, "js/data-basenectaris-maps.js")).BASE_NECTARIS_LEVELS,
  require(path.join(root, "js/data-ai-maps.js"))].flat();
require(path.join(root, "js/data-environment-campaigns.js")).forEach(c => boards.push(...c.levels));
module.exports = boards;
