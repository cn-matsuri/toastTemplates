# 烤推机模板库

这是 [TweetToaster](https://github.com/cn-matsuri/TweetToaster) 的历史落款模板与 Logo 素材库。模板仍使用 `{T}` 代表翻译文字，同时增加了机器可读的 [`catalog.json`](catalog.json)，新版烤推机可以搜索、收藏并在浏览器本地记住常用模板。

## 模板规范

- 模板是 UTF-8、LF 换行的 `.txt` HTML 片段。
- 图片放在 `img/`，模板内使用 `/template/img/文件名`；不再依赖 `raw.githubusercontent.com` 或 Base64 内嵌图片。
- Logo 按图片原始 CSS 像素显示，只在超过出图内容宽度时等比缩小，禁止强制指定 `height` 或同时指定宽高。
- `{T}` 必须至少出现一次。可用成对同名 HTML 注释保留多个历史变体。
- 不允许脚本、事件属性或远程资源。

新增模板时，请同时在 `catalog.json` 登记名称、文件、预览 Logo 和检索标签，然后运行：

```bash
npm run normalize
npm test
```

`normalize` 会移除 BOM/CRLF、失效的远程字体和强制 Logo 高度，并修正旧模板中未闭合的标签。`test` 会逐份检查所有模板、注释对和本地素材，不允许目录里出现未登记模板。

## 兼容旧链接

历史链接格式继续有效：

```text
https://tweet.wudifeixue.com/?template=/template/matsuri.txt
https://tweet.wudifeixue.com/?tweet=推文链接&template=/template/matsuri.txt
```

过去 README 中失效的 `aki_ship.txt` 和 `mel.txt` 已恢复；`mel.txt` 是 `yozora.txt` 的兼容入口，不会在新版素材库中重复显示。

## 授权

模板代码按本仓库 [`LICENSE`](LICENSE) 使用。各 Logo 的权利仍归其原作者或对应字幕组所有；整理与兼容不代表更改素材归属。
