#!/usr/bin/env python3
"""Import the user-selected unit chart; this is JPEG-derived, not a ROM atlas.

Requires Pillow only when rebuilding. Runtime uses checked-in indexed data.
Coordinates refer to the unmodified 579x635 source image.

The chart draws every sprite at exactly twice its size, so each art pixel is a
2x2 block of chart pixels. The import reads that grid instead of single JPEG
pixels: it averages each block, removes the flat card background by flood fill
from outside the sprite, and gives every remaining block the nearest of the
chart's seven colours. JPEG keeps brightness at full resolution but colour at
half resolution, so brightness dominates every colour comparison.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib, json

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'art/legacy/source/d2-01.jpg'
OUT=ROOT/'art/legacy/output'
# US ids are mapped by equipment/designation, not the chart's category order.
# エストール is MR-22/Octopus; ナスホルン is SG-4/Hadrian.
CENTERS={
 'CHARLIE':(509,109),'KILROY':(509,204),'PANTHER':(509,299),
 'BISON':(79,118),'LENET':(79,308),'POLAR':(175,213),'GRIZZLY':(175,118),
 'SLAGGER':(79,212),'TITAN':(175,308),'GIANT':(271,118),
 'EAGLE':(393,204),'FALCON':(393,109),'HUNTER':(393,299),
 'HADRIAN':(171,567),'OCTOPUS':(171,472),'ATLAS':(403,567),
 'RABBIT':(55,472),'LYNX':(55,567),'SEEKER':(285,472),'HAWKEYE':(285,567),
 'MULE':(519,472),'PELICAN':(519,567),'TRIGGER':(403,472),
}
JP=dict(zip(CENTERS,['ムンクス','ダーベック','ドレイパー','バイソン','レネット','アルマジロ','グリズリー','スラッガー','モンスター','ギガント','ジャビイ','ファルコ','ハンター','ナスホルン','エストール','モノケロス','ラビット','リンクス','シーカー','ホークアイ','ミュール','ペリカン','ヤマアラシ']))
# The chart's colours, darkest first; the list position is the frame code.
# Medians of chart blocks whose neighbours share their colour (least JPEG bleed).
CHART=[None,'#060606','#093a57','#397a97','#767b82','#15b8ef','#83fafb','#ecfeff']
FACTION_CODES=(2,3,5,6)
RAMPS={
 'union':[CHART[c] for c in FACTION_CODES],
 'xenon':['#163b16','#35661f','#68a838','#b0d46b'],
 'attack':['#481319','#81212e','#c63745','#eb7d80'],
 'neutral':['#273138','#4c6065','#7a9599','#bdcdd0'],
}
# The icon-set registry requires 16 entries; codes 8-f are unused, so any
# frame that referenced one would show magenta.
UNUSED=['#ff00ff']*8
PALETTES={faction:[dict(zip(FACTION_CODES,ramp)).get(code,color) for code,color in enumerate(CHART)]+UNUSED
 for faction,ramp in RAMPS.items()}
WINDOW=22 # art pixels per side of the area read around each chart centre

def rgb(c):return tuple(bytes.fromhex(c[1:]))
def ycc(c):
 r,g,b=c
 return (.299*r+.587*g+.114*b,128-.168736*r-.331264*g+.5*b,128+.5*r-.418688*g-.081312*b)
def distance(a,b):
 a,b=ycc(a),ycc(b)
 return 2*abs(a[0]-b[0])+.5*(abs(a[1]-b[1])+abs(a[2]-b[2]))
def median(colors):return tuple(sorted(c[k] for c in colors)[len(colors)//2] for k in range(3))
CHART_RGB={code:rgb(c) for code,c in enumerate(CHART) if c}

def grid_phase(source,cx,cy):
 """Chart x/y parity at which each 2x2 art pixel starts."""
 phase=[]
 for dx,dy in ((1,0),(0,1)):
  step=[0,0]
  for y in range(cy-20,cy+20):
   for x in range(cx-20,cx+20):
    a,b=source.getpixel((x,y)),source.getpixel((x+dx,y+dy))
    step[(x if dx else y)%2]+=sum(abs(a[k]-b[k]) for k in range(3))
  # Neighbours inside one art pixel differ only by JPEG noise.
  inside=min((0,1),key=lambda p:step[p])
  assert step[1-inside]>2*step[inside],('no 2x2 art-pixel grid',cx,cy,step)
  phase.append(inside)
 return phase

def art_pixels(source,cx,cy):
 px,py=grid_phase(source,cx,cy)
 x0=cx-WINDOW+(px-(cx-WINDOW))%2;y0=cy-WINDOW+(py-(cy-WINDOW))%2
 grid=[[tuple(sum(source.getpixel((x0+2*i+u,y0+2*j+v))[k] for u in (0,1) for v in (0,1))/4 for k in range(3))
  for i in range(WINDOW)] for j in range(WINDOW)]
 return (x0,y0),grid

def import_unit(source,id):
 """Return the sprite as rows of chart codes (0 transparent), cropped to its bounds."""
 origin,grid=art_pixels(source,*CENTERS[id]);n=WINDOW
 margin=[grid[j][i] for j in range(1,n-1) for i in (1,n-2)]+[grid[1][i] for i in range(1,n-1)]
 card=median(margin)
 assert sum(distance(c,card)>=25 for c in margin)<=len(margin)//10,(id,'card background is not uniform')
 references=dict(CHART_RGB,card=card)
 label=[[min(references,key=lambda k:distance(grid[j][i],references[k])) for i in range(n)] for j in range(n)]
 # Card-coloured art pixels reachable from outside the sprite are background.
 outside=set((i,j) for j in range(n) for i in range(n) if i in (0,n-1) or j in (0,n-1))
 todo=list(outside)
 while todo:
  i,j=todo.pop()
  for q in ((i+1,j),(i-1,j),(i,j+1),(i,j-1)):
   if 0<=q[0]<n and 0<=q[1]<n and q not in outside and label[q[1]][q[0]]=='card':outside.add(q);todo.append(q)
 # The sprite is the largest remaining region; smaller ones are card borders and captions.
 remaining=set((i,j) for j in range(n) for i in range(n) if (i,j) not in outside);regions=[]
 while remaining:
  region={remaining.pop()};todo=list(region)
  while todo:
   i,j=todo.pop()
   for q in ((i+1,j),(i-1,j),(i,j+1),(i,j-1)):
    if q in remaining:remaining.remove(q);region.add(q);todo.append(q)
  regions.append(region)
 sprite=max(regions,key=len)
 xs=[i for i,j in sprite];ys=[j for i,j in sprite]
 left,top,right,bottom=min(xs),min(ys),max(xs)+1,max(ys)+1
 assert right-left<=16 and bottom-top<=16 and 0<left and 0<top and right<n and bottom<n,(id,'sprite bounds',left,top,right,bottom)
 # Inside the outline, blurred dark pixels can sit nearer the card colour.
 rows=[[min(CHART_RGB,key=lambda k:distance(grid[j][i],CHART_RGB[k])) if (i,j) in sprite else 0
  for i in range(left,right)] for j in range(top,bottom)]
 return rows,{'chartOrigin':[origin[0]+2*left,origin[1]+2*top],'artPixels':[right-left,bottom-top]}

def frame(rows):
 """Centre the sprite in 32x32 with each art pixel as a 2x2 block, as on the original map."""
 ox,oy=16-len(rows[0]),16-len(rows)
 out=[['.']*32 for _ in range(32)]
 for y in range(2*len(rows)):
  for x in range(2*len(rows[0])):
   code=rows[y//2][x//2]
   if code:out[oy+y][ox+x]=format(code,'x')
 return [''.join(r) for r in out]

def colored(rows,faction,spent=False):
 im=Image.new('RGBA',(32,32));pal=PALETTES[faction]
 for y,row in enumerate(rows):
  for x,c in enumerate(row):
   if c=='.':continue
   color=rgb(pal[int(c,16)])
   if spent:color=(round(sum(v*k for v,k in zip(color,(.2126,.7152,.0722)))),)*3
   im.putpixel((x,y),color+(255,))
 return im

def main():
 assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='bcc5f5a34670a9b6049c738e6b0b6ade1157c99688bd482a2bbb0e178cd199f5','Source chart changed'
 source=Image.open(SOURCE).convert('RGB')
 assert source.size==(579,635)
 OUT.mkdir(parents=True,exist_ok=True)
 frames={};report=[]
 for id in CENTERS:
  rows,info=import_unit(source,id)
  right=frame(rows)
  frames[id]={'right':right,'left':[row[::-1] for row in right]}
  opaque=[(x,y) for y,row in enumerate(right) for x,c in enumerate(row) if c!='.']
  xs=[x for x,y in opaque];ys=[y for x,y in opaque]
  bounds=[min(xs),min(ys),max(xs)+1,max(ys)+1]
  assert bounds[0]==32-bounds[2],(id,bounds)
  report.append({'id':id,'japaneseName':JP[id],**info,'visibleBounds':bounds,'opaquePixels':len(opaque)})
  for facing,frame_rows in frames[id].items():
   for state in ('union','xenon','attack','spent'):
    colored(frame_rows,'union' if state=='spent' else state,state=='spent').save(OUT/(id.lower()+'-'+state+'-'+facing+'.png'))
 data={'frame':32,'anchor':[16,16],'light':'source shading; left facing mirrored','codes':'1234567','palettes':PALETTES,'descriptions':{id:'Legacy · '+JP[id] for id in CENTERS},'frames':frames}
 (ROOT/'js/data-unit-art-legacy.js').write_text('/* Generated by tools/import-legacy-unit-art.py from the user-selected JPEG chart. */\nvar LEGACY_UNIT_ART = '+json.dumps(data,ensure_ascii=False,indent=2)+';\nif(typeof module!=="undefined")module.exports=LEGACY_UNIT_ART;\n')
 sheet=Image.new('RGB',(548,480),'#14151f');draw=ImageDraw.Draw(sheet);font=ImageFont.load_default(size=10)
 draw.text((16,10),'LEGACY / 23 UNITS / 32 X 32 FRAMES',font=font,fill='#c0e4f6')
 for i,id in enumerate(CENTERS):
  x=18+(i%6)*88;y=32+(i//6)*112;draw.text((x+8,y),id,font=font,fill='#ecf4f0')
  for row,(facing,faction) in enumerate([('right','union'),('left','xenon')]):
   cx=x+32;cy=y+34+row*38
   draw.polygon([(cx-24,cy),(cx-8,cy-16),(cx+8,cy-16),(cx+24,cy),(cx+8,cy+16),(cx-8,cy+16)],fill='#482f36')
   im=colored(frames[id][facing],faction);sheet.paste(im,(cx-16,cy-16),im)
 sheet.save(OUT/'units-native.png')
 (OUT/'manifest.json').write_text(json.dumps({'source':'https://anka.sakura.ne.jp/nectaris/image/d2-01.jpg','sourcePage':'https://anka.sakura.ne.jp/nectaris/d2.html','sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'method':'2x2 chart blocks averaged into art pixels; card background removed by flood fill; brightness-weighted nearest of seven chart colours; no resampling','frame':32,'leftFacing':'mirrored source shading','unitCount':23,'units':report},ensure_ascii=False,indent=2)+'\n')
 print('Imported 23 Legacy units into 46 centered frames and 184 PNG variants.')

if __name__=='__main__':main()
