import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(await readFile(path.join(root, "catalog.json"), "utf8"));
const files = (await readdir(root)).filter((name) => name.endsWith(".txt")).sort();
const listed = catalog.templates.map((item) => item.file).sort();

assert.equal(catalog.version, 1);
assert.deepEqual(listed, files, "catalog.json 必须覆盖每一个模板文件");
assert.equal(new Set(catalog.templates.map((item) => item.id)).size, catalog.templates.length, "模板 id 不可重复");

for (const item of catalog.templates) {
  assert.match(item.id, /^[a-z0-9][a-z0-9_-]*$/i, `${item.file}: id 无效`);
  assert.ok(item.name?.trim(), `${item.file}: 缺少名称`);
  const source = await readFile(path.join(root, item.file), "utf8");
  assert.ok(source.includes("{T}"), `${item.file}: 缺少 {T}`);
  assert.ok(!source.startsWith("\uFEFF"), `${item.file}: 含 BOM`);
  assert.ok(!source.includes("\r"), `${item.file}: 换行符不是 LF`);
  assert.doesNotMatch(source, /https?:\/\//i, `${item.file}: 不应依赖远程资源`);
  assert.doesNotMatch(source, /data:image/i, `${item.file}: 图片应作为独立素材保存`);
  assert.doesNotMatch(source, /<script|\son[a-z]+\s*=/i, `${item.file}: 含危险 HTML`);
  assert.doesNotMatch(source, /\{T\}<h4>/, `${item.file}: h4 未闭合`);
  for (const match of source.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/gi)) {
    const tag = match[0];
    const src = match[1];
    assert.match(src, /^\/template\/img\/[A-Za-z0-9_.-]+$/, `${item.file}: 图片路径无效`);
    assert.doesNotMatch(tag, /\sheight=/i, `${item.file}: 不应强制缩放 Logo`);
    assert.match(tag, /max-width:100%;height:auto/i, `${item.file}: Logo 缺少等比防溢出样式`);
    await access(path.join(root, src.replace(/^\/template\//, "")));
  }
  const markers = [...source.matchAll(/<!--[\s\S]*?-->/g)].map((match) => match[0].slice(4, -3).trim());
  if (markers.length) {
    assert.equal(markers.length % 2, 0, `${item.file}: 模板注释必须成对`);
    for (let index = 0; index < markers.length; index += 2) {
      assert.equal(markers[index], markers[index + 1], `${item.file}: 模板注释未闭合`);
    }
  }
}

console.log(`Validated ${catalog.templates.length} templates and their local assets.`);
