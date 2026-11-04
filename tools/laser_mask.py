import sys, numpy as np
from PIL import Image, ImageFilter
from rembg import remove, new_session
sess=new_session('isnet-anime')
src, out = sys.argv[1], sys.argv[2]
im=Image.open(src).convert('RGB')
m=remove(im, session=sess, only_mask=True)   # 白＝人物
a=np.asarray(m).astype(np.float32)/255
a=np.clip((a-0.35)/0.3,0,1)
# 白墨版：黑＝上白墨（人物），白＝透雷射（背景）
mask=Image.fromarray(((1-a)*255).astype(np.uint8),'L').filter(ImageFilter.GaussianBlur(1.2))
mask.save(out)
