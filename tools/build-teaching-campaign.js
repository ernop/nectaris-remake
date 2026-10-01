/* Teaching campaign: the missions in teaching-campaign-specs.js, built with
 * the balance-study builder (same shapes, symmetry and movement checks).
 * build-environment-campaigns.js appends it to its own campaigns. */
"use strict";
const catalog=require("./teaching-campaign-specs.js"),{build}=require("./build-balance-campaigns.js");
function generate(){return catalog.map(c=>({id:c.id,name:c.name,description:c.intro,
  notes:"Sixteen AI-made battles created by Claude Opus 5.5, each introducing one thing a new player needs, on boards that grow from small to large. They were tuned so that when the strongest simulator bot plays both sides, Union wins nearly every game of the first three missions and about 60% of the last, and so that weaker bots playing Union win less often than it does. Normal capture/elimination rules apply. Forces start fresh each mission.",
  levels:c.levels.map((s,i)=>build(c,s,i))}));}
module.exports=generate;
