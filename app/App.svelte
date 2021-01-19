<script>

  import { importHelper, jspmPlugin } from '../utils'

  let babelLoaded = false

  let code = ''

  let transformed = ''

  $: htmlCode = `
    <!DOCTYPE html>
    <html>
      <body>
        <div id="root" />
        \<script type="module"\>${transformed}\<\/script>
      </body>
    </html>
  `

  async function transform() {
    const babel = await import(importHelper('@babel/core'))
    const presetReact = await import(importHelper('@babel/preset-react'))
    const renamePlugin = await import(importHelper('babel-plugin-transform-rename-import'))
    babel.transform(code, {
      plugins:[
        jspmPlugin
      ],
      presets: [
        presetReact.default
      ],
    }, (err, result) => {
      if (err) {
        console.error(err)
      } else {
        transformed = result.code
        console.log(result.code)
      }
    })
  }

</script>

<div>
  <textarea bind:value={code} name="code" id="code" cols="30" rows="10"></textarea>

  <iframe srcdoc={htmlCode} title="demo" frameborder="0"></iframe>

  <button on:click={transform}>trans</button>
</div>