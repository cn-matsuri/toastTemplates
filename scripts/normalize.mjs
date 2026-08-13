import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imageStyle = "display:block;max-width:100%;height:auto";

function normalizeImage(tag) {
  const withoutHeight = tag.replace(/\s+height=(?:"[^"]*"|'[^']*')/gi, "");
  if (/\sstyle=/i.test(withoutHeight)) return withoutHeight;
  return withoutHeight.replace(/\s*>$/, ` style="${imageStyle}">`);
}

function normalizeTemplate(source) {
  return source
    .replace(/^\uFEFF/, "")
    .replace(/\r\n?/g, "\n")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>\s*/gi, "")
    .replace(/font-family\s*:\s*'黑体-简'\s*,\s*mengnan\s*;?/gi,
      "font-family:'黑体-简','PingFang SC','Microsoft YaHei',sans-serif;")
    .replace(/src="template\/img\//gi, 'src="/template/img/')
    .replace(/url\(img\/twitterreplyblue\.png\)/gi, "url(/template/img/twitterreplyblue.png)")
    .replace(/<img\b[^>]*>/gi, normalizeImage)
    .replace(/\{T\}<h4>/g, "{T}</h4>")
    .trimEnd() + "\n";
}

async function extractOnionAsset(source) {
  const match = source.match(/src="data:image\/png;base64,([^"]+)"/i);
  if (!match) return source;
  await writeFile(path.join(root, "img/onion_small.png"), Buffer.from(match[1], "base64"));
  return source.replace(match[0], 'src="/template/img/onion_small.png"');
}

await mkdir(path.join(root, "img"), { recursive: true });
const files = (await readdir(root)).filter((name) => name.endsWith(".txt")).sort();
for (const name of files) {
  const file = path.join(root, name);
  let source = await readFile(file, "utf8");
  if (name === "onion.txt") source = await extractOnionAsset(source);
  await writeFile(file, normalizeTemplate(source));
}

// Restore the two historical README links without duplicating them in the visible catalog.
const aliases = new Map([
  ["aki_ship.txt", "<!--Aki 深夜食堂旧版--><div style=\"margin:10px 15px\"><img src=\"/template/img/aki_ship_small.png\" style=\"display:block;max-width:100%;height:auto\"><div style=\"font-size:27px;max-width:100%;word-break:break-word\">{T}</div></div><!--Aki 深夜食堂旧版-->\n"],
  ["mel.txt", "<!--夜空梅露翻译组--><div style=\"margin:10px 15px\"><img src=\"/template/img/yozora_small.png\" style=\"display:block;max-width:100%;height:auto\"><div style=\"font-size:27px;max-width:100%;word-break:break-word\">{T}</div></div><!--夜空梅露翻译组-->\n"]
]);
for (const [name, source] of aliases) await writeFile(path.join(root, name), source);
