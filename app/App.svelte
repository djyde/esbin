<script>
  import { importHelper, jspmPlugin } from "./utils";
  import { currentImportPackage } from "./store";
  import { onMount } from "svelte";
  import throttle from 'lodash.throttle'

  const defaultCode = `import React from 'react'
import { render } from 'react-dom'

const App = () => <div>Hello ESbin</div>

render(<App />, document.querySelector('#root'))`;

  let transformed = "";

  let transforming = false;

  let cm;

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
      theme: "duotone-light",
      lineNumbers: true,
      mode: "javascript",
    });

    function onChange (i) {
      transform()
    }

    cm.on('change', throttle(onChange, 1500, { leading: false}))

    onChange(cm)
  });

  async function transform() {
    if (!cm) {
      return;
    }

    transforming = true;

    const babel = await importHelper("@babel/core");
    const presetReact = await importHelper("@babel/preset-react");
    const renamePlugin = await importHelper(
      "babel-plugin-transform-rename-import"
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

        transforming = false;
      }
    );
  }
</script>

<div class="h-full flex flex-col">
  <nav class="p-4 shadow-sm mb-1 flex">
    <span class="font-bold">ESbin</span>

    <div class="flex flex-1 justify-center">
      <div class="self-center">

      </div>
    </div>
  </nav>

  <div class="h-full flex">
    <div id="editor" class="flex-1 flex flex-col">
      <div bind:this={editor} class="flex-1 overflow-scroll"></div>
    </div>

    <div id="preview" class="flex-1 relative">
      <iframe class="w-full" srcdoc={htmlCode} title="demo" frameborder="0" />

      {#if transforming}
        <div class="absolute bg-black bg-opacity-10 w-full h-full inset-0 flex justify-center">
          <div class="self-center flex flex-col">
            <div class="self-center">
              <svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0" width="64px" height="64px" viewBox="0 0 128 128" xml:space="preserve"><g><path d="M.6 57.54c5.73-6.23 17.33-15.5 33.66-12.35C55.4 48.5 64 63.95 64 63.95S42.42 65 30.28 83.63a38.63 38.63 0 0 0-3.4 32.15 64.47 64.47 0 0 1-5.52-4.44A63.64 63.64 0 0 1 .6 57.54z" fill="#ffcb02"/><path d="M65.32 29.05c7.65 19.98-1.44 35.18-1.44 35.18S52.2 46.05 30.03 44.85A38.6 38.6 0 0 0 .56 57.93 63.8 63.8 0 0 1 37.56 6c8.2 1.8 22.26 7.16 27.76 23.05z" fill="#ff9e02"/><path d="M94.92 47.7c-13.48 16.63-31.2 16.36-31.2 16.36s9.92-19.2-.13-39a38.6 38.6 0 0 0-26.18-19 63.78 63.78 0 0 1 63.52 6.03c2.56 8 4.98 22.85-6.05 35.6z" fill="#ff4b42"/><path d="M93.52 82.53C72.38 79.17 63.75 63.7 63.75 63.7s21.6-1.02 33.7-19.63a38.6 38.6 0 0 0 3.43-32.04 64.33 64.33 0 0 1 5.74 4.6 63.63 63.63 0 0 1 20.82 53.26c-5.62 6.2-17.34 15.8-33.94 12.6z" fill="#c063d6"/><path d="M62.5 99c-7.65-19.98 1.44-35.17 1.44-35.17S75.56 81.6 97.74 82.8a39.1 39.1 0 0 0 29.73-13.03 63.8 63.8 0 0 1-37.16 52.3c-8.2-1.8-22.25-7.15-27.8-23.06z" fill="#17a4f6"/><path d="M26.64 115.63C24 107.6 21.6 93.06 32.5 80.5c13.48-16.62 31.58-16.55 31.58-16.55s-9.6 19.06.44 38.86a38.82 38.82 0 0 0 26.05 19.17 63.78 63.78 0 0 1-63.93-6.3z" fill="#4fca24"/><animateTransform attributeName="transform" type="rotate" from="0 64 64" to="360 64 64" dur="600ms" repeatCount="indefinite"></animateTransform></g></svg>
            </div>
            <div class="mt-4">
              <div>
                It might take some time if it's the first time loading
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
