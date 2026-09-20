#!/usr/bin/env python3
"""Import the user-selected unit chart; this is JPEG-derived, not a ROM atlas.

Requires Pillow only when rebuilding. Runtime uses checked-in indexed data.
Coordinates refer to the unmodified 579x635 source image. Remove chart backgrounds,
quantize compression noise, and normalize transparent frames without inventing art.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib, json

ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'art/legacy/source/d2-01.jpg'
OUT=ROOT/'art/legacy/output'
OUT.mkdir(parents=True,exist_ok=True)
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
UNION=[None,'#080c10','#153039','#42616a','#90b7bf','#f0ffff',
 '#06384d','#086280','#109cbe','#66cedc','#b0eef4','#15222b','#66858b','#9c6a25','#f2cb58','#111820']
RAMPS={
 'union':UNION[6:11],
 'xenon':['#163b16','#35661f','#68a838','#b0d46b','#e4f4b2'],
 'attack':['#481319','#81212e','#c63745','#eb7d80','#ffd4c8'],
 'neutral':['#273138','#4c6065','#7a9599','#bdcdd0','#edf4f4'],
}
PALETTES={key:UNION[:6]+ramp+UNION[11:] for key,ramp in RAMPS.items()}
def rgb(c):return tuple(bytes.fromhex(c[1:]))
COLORS={i:rgb(c) for i,c in enumerate(UNION) if c}
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest()=='bcc5f5a34670a9b6049c738e6b0b6ade1157c99688bd482a2bbb0e178cd199f5', 'Source chart changed'
source=Image.open(SOURCE).convert('RGB')
assert source.size==(579,635)
frames={};report=[]

def import_unit(id,cx,cy):
 crop=source.crop((cx-17,cy-17,cx+17,cy+17));core=set()
 for y in range(34):
  for x in range(34):
   r,g,b=crop.getpixel((x,y))
   if (b>r+18 and g>r+12 and g>48) or (min(r,g,b)>150 and max(r,g,b)-min(r,g,b)<75):core.add((x,y))
 mask=set(core)
 for x,y in core:
  for dy in range(-2,3):
   for dx in range(-2,3):
    xx,yy=x+dx,y+dy
    if not(0<=xx<34 and 0<=yy<34):continue
    r,g,b=crop.getpixel((xx,yy))
    if max(r,g,b)<64 and max(r,g,b)-min(r,g,b)<30:mask.add((xx,yy))
 # Ignore isolated JPEG speckles, retaining components connected to the main sprite.
 components=[];todo=set(mask)
 while todo:
  pending=[todo.pop()];component=set(pending)
  while pending:
   x,y=pending.pop()
   for dx,dy in [(1,0),(-1,0),(0,1),(0,-1)]:
    p=(x+dx,y+dy)
    if p in todo:todo.remove(p);component.add(p);pending.append(p)
  components.append(component)
 mask=set().union(*(c for c in components if len(c)>=4))
 xs=[x for x,y in mask];ys=[y for x,y in mask]
 bbox=(min(xs),min(ys),max(xs)+1,max(ys)+1)
 indexed=Image.new('L',(34,34))
 for x,y in mask:
  color=crop.getpixel((x,y));r,g,b=color
  # Greys stay neutral; cyan surfaces use the faction ramp.
  candidates=range(6,11) if b-r>24 and g-r>15 else [1,2,3,4,5,11,12,15]
  index=min(candidates,key=lambda i:sum((color[n]-COLORS[i][n])**2 for n in range(3)))
  indexed.putpixel((x,y),index)
 indexed=indexed.crop(bbox)
 max_height=17 if id in ('CHARLIE','KILROY','PANTHER') else 28
 scale=min(1,28/indexed.width,max_height/indexed.height)
 width=max(2,round(indexed.width*scale/2)*2);height=max(2,round(indexed.height*scale))
 indexed=indexed.resize((width,height),Image.Resampling.NEAREST)
 # Crop sampling margins before checking the final centered hex envelope.
 indexed=indexed.crop(indexed.getbbox())
 if indexed.width%2:
  indexed=indexed.resize((indexed.width+1,indexed.height),Image.Resampling.NEAREST)
 # Fit the common flattened-hex safety envelope, using only nearest sampling.
 while True:
  pixels=list(indexed.get_flattened_data());w,h=indexed.size;ox=(32-w)//2;oy=(32-h)//2
  if all(not v or abs(x+ox+.5-16)+abs(y+oy+.5-16)<=22 for y in range(h) for x in range(w) for v in [pixels[y*w+x]]):break
  width-=2;height=max(2,round(indexed.height*width/indexed.width));indexed=indexed.resize((width,height),Image.Resampling.NEAREST)
  indexed=indexed.crop(indexed.getbbox())
  if indexed.width%2:indexed=indexed.resize((indexed.width+1,indexed.height),Image.Resampling.NEAREST)
 frame=Image.new('L',(32,32));frame.paste(indexed,((32-indexed.width)//2,(32-indexed.height)//2))
 rows=[''.join(format(v,'x') if v else '.' for v in list(frame.get_flattened_data())[y*32:y*32+32]) for y in range(32)]
 bounds=frame.getbbox()
 assert bounds[0]==32-bounds[2] and 2<=bounds[0] and bounds[2]<=30,(id,bounds)
 assert id not in ('CHARLIE','KILROY','PANTHER') or bounds[3]-bounds[1]<=17
 report.append({'id':id,'japaneseName':JP[id],'sourceCrop':[cx-17,cy-17,34,34],'visibleBounds':list(bounds),'opaquePixels':sum(bool(v) for v in frame.get_flattened_data())})
 return rows

def colored(rows,faction,spent=False):
 im=Image.new('RGBA',(32,32));pal=PALETTES[faction]
 for y,row in enumerate(rows):
  for x,c in enumerate(row):
   if c=='.':continue
   color=rgb(pal[int(c,16)])
   if spent:color=(round(sum(v*k for v,k in zip(color,(.2126,.7152,.0722)))),)*3
   im.putpixel((x,y),color+(255,))
 return im

for id,(x,y) in CENTERS.items():
 right=import_unit(id,x,y)
 frames[id]={'right':right,'left':[row[::-1] for row in right]}
 for facing,rows in frames[id].items():
  for state in ('union','xenon','attack','spent'):
   colored(rows,'union' if state=='spent' else state,state=='spent').save(OUT/(id.lower()+'-'+state+'-'+facing+'.png'))
data={'frame':32,'anchor':[16,16],'light':'source shading; left facing mirrored','codes':'123456789abcdef','palettes':PALETTES,'descriptions':{id:'Legacy · '+JP[id] for id in CENTERS},'frames':frames}
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
(OUT/'manifest.json').write_text(json.dumps({'source':'https://anka.sakura.ne.jp/nectaris/image/d2-01.jpg','sourcePage':'https://anka.sakura.ne.jp/nectaris/d2.html','sha256':hashlib.sha256(SOURCE.read_bytes()).hexdigest(),'method':'JPEG-derived crops; background removal, shared-palette quantization, nearest-neighbor normalization','frame':32,'leftFacing':'mirrored source shading','unitCount':23,'units':report},ensure_ascii=False,indent=2)+'\n')
print('Imported 23 Legacy units into 46 centered frames and 184 PNG variants.')
