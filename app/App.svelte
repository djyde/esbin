<script>
  import { importHelper, jspmPlugin } from "../utils";
  import { onMount } from "svelte";

  const defaultCode = `import React from 'react'
import { render } from 'react-dom'

const App = () => <div>Hello ESbin</div>

render(<App />, document.querySelector('#root'))`

  let babelLoaded = false;
  let code = "";
  let transformed = "";

  let cm

  $: htmlCode = `
    <!DOCTYPE html>
    <html>
      <body>
        <div id="root" />
        \<script type="module"\>${transformed}\<\/script>
      </body>
    </html>
  `;

  let editor;

  onMount(() => {
    cm = window.CodeMirror(editor, {
      value: defaultCode,
      theme: 'duotone-light',
      lineNumbers: true,
      mode: 'javascript'
    });
  });

  async function transform() {
    if (!cm) {
      return
    }

    const babel = await import(importHelper("@babel/core"));
    const presetReact = await import(importHelper("@babel/preset-react"));
    const renamePlugin = await import(
      importHelper("babel-plugin-transform-rename-import")
    );
    babel.transform(
      cm.getValue(),
      {
        plugins: [jspmPlugin],
        presets: [presetReact.default],
      },
      (err, result) => {
        if (err) {
          console.error(err);
        } else {
          transformed = result.code;
          console.log(result.code);
        }
      }
    );
  }
</script>

<div class="h-full flex flex-col">
  <nav class="p-4 shadow-sm mb-1 flex">
    <span class="font-bold">ESbin</span>

    <div>
      <button class="bg-green-500 text-gray-50 px-2 ml-2" on:click={transform}
        >Run</button
      >
    </div>
  </nav>

  <div class="h-full flex">
    <div id="editor" class="flex-1">
      <div bind:this={editor} class="w-full h-full" />
    </div>

    <div id="preview" class="flex-1">
      <iframe class="w-full" srcdoc={htmlCode} title="demo" frameborder="0" />
    </div>
  </div>
</div>
