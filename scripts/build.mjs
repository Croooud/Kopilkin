// Собирает dist/index.html: src/App.jsx → обычный JS (React из CDN) → в шаблон web/index.html.
// Запуск: npm run build
import fs from "node:fs";
import ts from "typescript";

let code = fs.readFileSync("src/App.jsx", "utf8");
code = code
  .replace(/import React,\s*\{([^}]*)\}\s*from\s*"react";/, "const {$1} = React;")
  .replace(/import\s*\{([^}]*)\}\s*from\s*"lucide-react";/, "const {$1} = __icons;")
  .replace("export default function App", "function App");
if (/^\s*(import|export)\b/m.test(code)) throw new Error("В src/App.jsx остался import/export, который сборка не знает");

const out = ts.transpileModule(code, {
  compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020, removeComments: false },
  reportDiagnostics: true,
});
if (out.diagnostics && out.diagnostics.length) {
  for (const d of out.diagnostics) console.error(ts.flattenDiagnosticMessageText(d.messageText, "\n"));
  process.exit(1);
}

// Иконки lucide-react берутся из UMD-сборки; если какой-то нет — рисуем пустоту, а не падаем
const js = `(function(){
var __fallback = function(){ return null; };
var __icons = new Proxy(window.LucideReact || {}, { get: function(t, k){ return t[k] || __fallback; } });
${out.outputText}
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();`.replace(/<\/script/gi, "<\\/script");

const tpl = fs.readFileSync("web/index.html", "utf8");
if (!tpl.includes("<!--APP-->")) throw new Error("В web/index.html нет метки <!--APP-->");
fs.mkdirSync("dist", { recursive: true });
fs.writeFileSync("dist/index.html", tpl.replace("<!--APP-->", () => `<script>\n${js}\n</script>`));
console.log(`dist/index.html готов (${Math.round(fs.statSync("dist/index.html").size / 1024)} КБ)`);
