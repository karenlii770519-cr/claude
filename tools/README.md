# 網站工具

| 檔案 | 用途 |
|---|---|
| `build_works.py` + `works.tpl.html` | 產生 `works.html`（作品清單在 `build_works.py` 的 `P`）。執行：`python3 tools/build_works.py` |
| `split_acrylic.py` | 把壓克力完稿拆成 `img/works/acrylic/<款>/art.png、white.png、cut.png`（需要 numpy、scipy、Pillow） |
| `laser_mask.py` | 雷射卡人物白墨版（rembg isnet-anime 模型，本機處理）。`python3 tools/laser_mask.py 原圖 輸出-mask.png` |

網站從 `claude/sweet-fermi-ztjjcj` 分支發布到 karenlii.com。

## 待辦（下次接著做）

- **從 Tumblr 抓作品**：https://karenliii.tumblr.com/ （環境網路已允許 karenliii.tumblr.com、64.media.tumblr.com、va.media.tumblr.com）
  - 抓太快會被 Tumblr 回 429，每篇之間要等幾秒
  - 大航海時代：應在第 4 頁「手遊廣告banner」那篇（post/731490949783535617）→ 放「遊戲 KV・Banner」，排在文明帝國旁
  - 派愛族（Pairs）：第 3～4 頁的「交友軟體…」幾篇（post/731492193365327872、731491957787049984、731492604252979200、731492417160855552、731492311123542016）→ 併進「日本市場 影音廣告」
  - 其他還沒放上網站的：巴哈姆特版位廣告、日本減重輔助 app banner、JR 東日本秋葉原駅 OOH、日本健康補助食品／繪文字 app／美容預約網站 短影音、日系保養品 banner、洗顏粉短影音、家電臉書貼文、App 商店預覽圖、日本健身房廣告、日本購物網站活動影片、手工餅乾包裝、ettusais／KIRIN／全聯 × SOU・SOU 包裝、2018 遊戲廣告 banner
- 曼秀雷敦影片目前嵌 Google Drive（有黑邊）；若 Karen 傳到 YouTube（不公開），改成 YouTube 嵌入
- 碧藍航線 × 吉豚屋年份待確認（暫寫 2024）
- 其他聯名（好想吃冰、涮乃葉、老先覺、麵匡匡、戰雙 × 一風堂）要不要放回「IP 餐飲聯名」待確認
