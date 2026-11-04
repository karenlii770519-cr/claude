# 從一張壓克力吊飾完稿圖拆出：art.png（彩色、透明底）、white.png（白墨）、cut.png（刀模外型，含吊孔）
import sys, numpy as np
from pathlib import Path
from PIL import Image
from scipy import ndimage

def split(src, out, maxside=1400):
    im = Image.open(src).convert('RGB')
    s = min(1, maxside / max(im.size)); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    a = np.asarray(im).astype(np.int16)
    mn, mx = a.min(2), a.max(2)
    # 1) 刀模外型：從四邊往內填「接近白」的背景
    white = mn > 238
    lab, _ = ndimage.label(white)
    edge = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
    cut = ~np.isin(lab, list(edge))
    cut = ndimage.binary_opening(cut, iterations=1)
    # 刀模線若是一條細線（中間有斷點），先補起來再把線內整塊填滿
    cut = ndimage.binary_fill_holes(ndimage.binary_closing(np.pad(cut, 40), iterations=max(3, round(im.width * 0.02))))[40:-40, 40:-40]
    # 2) 印刷範圍：刀模往內縮掉刀模線與透明邊之後，取有顏色的部分，再補滿內部（白髮、白衣不破洞）
    k = max(3, round(im.width * 0.012))
    inner = ndimage.binary_erosion(cut, iterations=k)
    ink = inner & ~((mn > 247) & (mx - mn < 6))
    lab2, n2 = ndimage.label(ink)
    if n2:
        sizes = ndimage.sum(ink, lab2, range(1, n2 + 1))
        keep = np.isin(lab2, [i + 1 for i, v in enumerate(sizes) if v > ink.sum() * 0.02])
    else:
        keep = ink
    pr = ndimage.binary_closing(keep, iterations=4)
    pr = ndimage.binary_fill_holes(pr)
    pr &= cut
    out.mkdir(parents=True, exist_ok=True)
    rgba = np.dstack([a.astype(np.uint8), (pr * 255).astype(np.uint8)])
    Image.fromarray(rgba, 'RGBA').save(out / 'art.png')
    Image.fromarray(np.dstack([np.zeros_like(a, np.uint8), (pr * 255).astype(np.uint8)]), 'RGBA').save(out / 'white.png')
    # 刀模：保留原圖外型（吊孔是內部的白色小圓，標成透明）
    holes = cut & ~pr & (mn > 238)
    hl, hn = ndimage.label(holes)
    cutm = cut.copy()
    for i in range(1, hn + 1):
        ys, xs = np.nonzero(hl == i)
        if len(ys) < 20 or ys.mean() > im.height * 0.3: continue
        bw, bh = np.ptp(xs) + 1, np.ptp(ys) + 1
        if abs(bw - bh) < max(bw, bh) * 0.4 and len(ys) / (bw * bh) > 0.55 and len(ys) < cut.sum() * 0.01:
            cutm[hl == i] = False
    c = np.dstack([np.full_like(a, 255, np.uint8), (cutm * 255).astype(np.uint8)])
    Image.fromarray(c, 'RGBA').save(out / 'cut.png')

if __name__ == '__main__':
    root = Path(__file__).resolve().parent.parent / 'img' / 'works'
    for name, f in [('azurlane-chaoho', 'azurlane-shabu/acrylic-charm-01.jpg'), ('azurlane-chenhai', 'azurlane-shabu/acrylic-charm-02.jpg'),
                    ('ba-airi', 'bluearchive-festival/acrylic-charm-01.jpg'), ('ba-kazusa', 'bluearchive-festival/acrylic-charm-02.jpg')]:
        split(root / f, root / 'acrylic' / name)
        print('done', name)
