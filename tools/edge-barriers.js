/* Edge barriers (user, 2026-09-30): on Open Horizons, The Knotted Heart,
 * Broken Ground and Bridgeheads no army may circle the board along its rim.
 * `edgeRun` names the top or bottom strip, `depth` rows deep, along which a
 * vehicle can drive from the left edge to the right edge on open ground
 * (plain, road, bridge or camp), or returns null when barriers cut both.
 * Hills, wasteland, mountains, valleys and factories all count as cuts. */
"use strict";
const HEX=require("../js/hex.js");
const OPEN=new Set([".","-","=","B"]);
function edgeRun(grid,depth=3){
  const h=grid.length,w=grid[0].length;
  for(const [name,rows] of [["top",[0,depth-1]],["bottom",[h-depth,h-1]]]){
    const open=(c,r)=>c>=0&&c<w&&r>=rows[0]&&r<=rows[1]&&OPEN.has(grid[r][c]);
    const queue=[],seen=new Set();
    for(let r=rows[0];r<=rows[1];r++)if(open(0,r)){queue.push([0,r]);seen.add("0,"+r);}
    for(let i=0;i<queue.length;i++){
      const [c,r]=queue[i];if(c===w-1)return name;
      HEX.neighbors(c,r).forEach(n=>{const k=n.col+","+n.row;if(!seen.has(k)&&open(n.col,n.row)){seen.add(k);queue.push([n.col,n.row]);}});
    }
  }
  return null;
}
module.exports={edgeRun};
