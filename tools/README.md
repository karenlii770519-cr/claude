# 網站工具

| 檔案 | 用途 |
|---|---|
| `build_works.py` + `works.tpl.html` | 產生 `works.html`（作品清單在 `build_works.py` 的 `P`）。執行：`python3 tools/build_works.py` |
| `split_acrylic.py` | 把壓克力完稿拆成 `img/works/acrylic/<款>/art.png、white.png、cut.png`（需要 numpy、scipy、Pillow） |
| `laser_mask.py` | 雷射卡人物白墨版（rembg isnet-anime 模型，本機處理）。`python3 tools/laser_mask.py 原圖 輸出-mask.png` |

網站從 `claude/sweet-fermi-ztjjcj` 分支發布到 karenlii.com。
