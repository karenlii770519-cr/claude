import glob, os, json, re, html
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
P = [
 ('civilization-alliance','文明帝國：同盟時代（2K）','2025','game','上市宣傳 KV、代言人視覺、各版位 Banner','kv-01'),
 ('vindictus-nexon','新瑪奇英雄傳（NEXON）','2024／2026','game','改版 KV、改版宣傳素材（角色多方向提案）','kv-01'),
 ('wutheringwaves-ooh','鳴潮 北中南 OOH','2024.06','game','北中南戶外廣告','01'),
 ('racingmaster-jpkr','Racing Master 巔峰極速 日韓 Banner','2024.05','game','日本・韓國市場 Banner','01'),
 ('browndust2-3rd','BrownDust2 3 週年','','game','活動 Banner','banner-01'),
 ('quintessential-banner','五等分的花嫁 手遊 Banner','2023.11','game','手遊 Banner','01'),
 ('youtube-thumbnails','YouTube 告知縮圖','2023.11','game','日本手遊 YouTube 告知サムネイル','01'),
 ('dermacept','Dermacept 精品保養','','brand','KV、週年慶素材、社群廣告；AI 產品合成與人物處理','ad-07'),
 ('ricola-ooh','Ricola 利口樂 × IU','','brand','捷運 OOH（松江南京、市政府、左營）、北捷車廂橫幅、7-11 FIFA 促銷','promo-01'),
 ('sanlux-campaign-page','台灣三洋 SANLUX 活動頁','2024.03','brand','活動頁長圖','02'),
 ('sanlux-social-ads','台灣三洋 SANLUX 社群廣告','2025.06','brand','社群廣告素材（靜態＋動態）','01'),
 ('weiwang-packaging','味王 即食商品包裝','2024','brand','包裝設計','01'),
 ('jp-3c-banner','日本向 3C 產品 Banner','2023.10','brand','日本市場 Banner','01'),
 ('offerme2-catalog','OFFERME2 公司型錄 中日韓三語','','brand','型錄設計＋三語在地化（正反面）','zh-front-01'),
 ('putien','王品 莆田','','brand','年度宣傳提案、沙茶系列社群素材','social-03'),
 ('matthew-select','馬修嚴選','','brand','Pro+ 乳蛋白系列社群素材','social-03'),
 ('mentholatum','曼秀雷敦','','brand','社群素材','social-01'),
 ('mobile-new-chapter-video','手遊宣傳・活動影片','2023.11','video','主線新章宣傳影片、IP 遊戲活動影片','01'),
 ('jp-coser-greenscreen','日本手遊廣告 Coser 綠幕影片','2023.10','video','綠幕去背後製','01'),
 ('fatgoose-gym-jp-video','肥鵝健身房 日本影音廣告','2024.05','video','日本網路影音廣告','01'),
 ('fatgoose-gym-jp-ad','肥鵝健身房 日本網路廣告','2024.05','video','日本網路廣告','01'),
 ('jp-app-shorts','日本 App 短影音（PayPayフリマ・minimo・Simeji）','','video','日本市場 App 廣告短影音','01'),
 ('manga-app-shorts','漫畫 App 短影音','2023.11','video','短影音','01'),
]
CAT = {'game':'遊戲 KV・Banner','brand':'品牌','video':'影片'}
LBL = [('poster-a3','A3 海報'),('a4-mission','A4 任務說明'),('acrylic-charm','壓克力吊飾'),('clear-card','透卡'),('paper-card','紙卡'),
 ('backing-card','背卡'),('handheld-sign','手拿牌'),('message-board','螢幕留言板'),('message-wall','留言牆'),('staff-pass','工作證'),
 ('mic-sign','麥克風牌'),('table-standee','桌上立牌'),('number-tag','號碼牌'),('guitar-pick','吉他撥片'),('ja-front','日文版 正面'),
 ('ja-back','日文版 背面'),('ko-front','韓文版 正面'),('ko-back','韓文版 背面'),('zh-front','中文版 正面'),('zh-back','中文版 背面'),
 ('2x6','2×6 公版'),('kv','主視覺'),('poster','海報'),('photo','現場照'),('card','插卡'),('coaster','杯墊'),('memo','便條紙'),
 ('a4','A4'),('standee','立牌'),('cup','杯身'),('keychain','鑰匙圈'),('notice','告示牌'),('banner','Banner'),('bowl','外帶紙碗'),
 ('online','線上素材'),('wheel','轉盤'),('ad','廣告素材'),('ooh','OOH'),('promo','促銷物'),('social','社群素材'),('charm','吊飾')]
def label(stem):
    for k,v in LBL:
        if stem==k or stem.startswith(k+'-'): return v
    return stem
from PIL import Image
data=[]
for slug,title,year,cat,role,cover in P:
    if cat not in CAT: continue
    EXTRA={'mobile-new-chapter-video':['ip-game-event-video']}
    files=[f for sl in [slug]+EXTRA.get(slug,[]) for f in sorted(glob.glob(f'img/works/{sl}/*.*')) if not f.endswith('.md')]
    items=[]
    for f in files:
        stem=os.path.splitext(os.path.basename(f))[0]
        vid=f.endswith('.mp4')
        t=os.path.join(os.path.dirname(f),'thumb',stem+'.webp')
        w,h=Image.open(t if vid else f).size
        items.append({'f':f,'t':t,'l':'影片' if vid else label(stem),'w':w,'h':h,'s':stem,'v':vid})
    # 封面排第一
    items.sort(key=lambda it:(it['s']!=cover,))
    data.append({'slug':slug,'title':title,'year':year,'cat':cat,'role':role,'items':items})


e=html.escape
# 案子要嵌入的 YouTube 影片（影片 ID 或 videoseries 播放清單）
YT={'jp-app-shorts':{'shorts':['mUrF8nupXoQ'],'t':'日本 App 短影音'},'wutheringwaves-ooh':{'v':'bBkcXdV68A8','list':'PLXUtZyKVAWrdpslJY70AyXAFylXmgu2_S','t':'鳴潮 北中南 OOH 影片'}}
def yt_html(slug):
    y=YT.get(slug)
    if not y: return ''
    if 'shorts' in y:
        fr=''.join(f'<div class="yts"><iframe src="https://www.youtube-nocookie.com/embed/{v}?rel=0" title="{e(y["t"])}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' for v in y['shorts'])
        return f'<div class="ytgrid">{fr}</div>\n    '
    src=f"https://www.youtube-nocookie.com/embed/{y['v']}?list={y['list']}&rel=0"
    return f'<div class="yt"><iframe src="{src}" title="{e(y["t"])}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>\n    '
def kind(it):
    r=it['w']/it['h']
    photo=it['s'].startswith('photo')
    k='photo' if photo else 'flat'
    if r>=1.6: k+=' wide'
    elif r<=0.62: k+=' tall'
    return k
secs=[]
for p in data:
    figs=''.join(
      f'<figure class="{kind(it)}{" vid" if it["v"] else ""}"><button type="button" data-i="{i}" aria-label="放大 {e(p["title"])} {e(it["l"])}">'
      f'<img src="{it["t"]}" alt="{e(p["title"])}｜{e(it["l"])}" width="{round(it["w"]*min(1,720/max(it["w"],it["h"])))}" height="{round(it["h"]*min(1,720/max(it["w"],it["h"])))}" loading="lazy" decoding="async"></button></figure>'
      for i,it in enumerate(p['items']))
    meta=' ・ '.join(x for x in [p['year'],CAT[p['cat']],((f"{len(YT[p['slug']]['shorts'])} 支" if 'shorts' in YT.get(p['slug'],{}) else 'YouTube 播放清單') if not p['items'] else f'{len(p["items"])} 支' if p['cat']=='video' else f'{len(p["items"])} 張')] if x)
    secs.append(f'''  <section class="proj" id="{p['slug']}" data-cat="{p['cat']}" data-full='{e(json.dumps([[it['f'],it['l'],1 if it['v'] else 0] for it in p['items']],ensure_ascii=False))}'>
    <div class="ph-head"><h2>{e(p['title'])}</h2><p class="meta">{e(meta)}</p><p class="role"><b>負責</b>{e(p['role'])}</p></div>
    {yt_html(p['slug'])}<div class="grid">{figs}</div>
  </section>''')
counts={c:sum(1 for p in data if p['cat']==c) for c in CAT}
chips='<button type="button" class="on" data-f="all">全部 <i>%d</i></button>'%len(data)+''.join(f'<button type="button" data-f="{c}">{v} <i>{counts[c]}</i></button>' for c,v in CAT.items())
tpl=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'works.tpl.html')).read()
out=tpl.replace('{{CHIPS}}',chips).replace('{{SECTIONS}}','\n'.join(secs)).replace('{{TOTAL}}',str(sum(len(p['items']) for p in data)))
open('works.html','w').write(out)
print('projects',len(data),'images',sum(len(p['items']) for p in data))
