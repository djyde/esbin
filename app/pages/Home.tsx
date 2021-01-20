import loader from '@monaco-editor/loader'
import { Box, ChakraProvider, Flex, Grid, Image, Link, Spacer, Stack, Text, VStack } from "@chakra-ui/react"
import React, { useState } from 'react'
import { db, defaultCSSCode, defaultJSCode, makeHTML, transformCSS, transformJS } from '../utils'
import { throttle } from 'lodash'
// @ts-expect-error
import loading from '../loading.svg'

console.log(loading)

export default function Home() {

  const $cssEditor = React.useRef(null)
  const $jsEditor = React.useRef(null)

  const [transformedCSS, setTransformedCSS] = useState('')
  const [transformedJS, setTransformedJS] = useState('')
  const [transformingCSS, setTransformingCSS] = useState(false)
  const [transformingJS, setTransformingJS] = useState(false)

  const [transformTimeCSS, setTransformTimeCSS] = useState(0)
  const [transformTimeJS, setTransformTimeJS] = useState(0)

  async function init() {
    const monaco = await loader.init()

    const jsEditor = monaco.editor.create($jsEditor.current, {
      value: await db.getItem('js') || defaultJSCode,
      language: 'javascript',
      minimap: {
        enabled: false
      }
    })

    const cssEditor = monaco.editor.create($cssEditor.current, {
      value: await db.getItem('css') || defaultCSSCode,
      language: 'css',
      minimap: {
        enabled: false
      }
    })

    async function updateJSFromEditor() {
      const value = jsEditor.getModel().getValue()
      setTransformingJS(true)
      try {
        const transformed = await transformJS(value)
        setTransformedJS(transformed.js)
        setTransformTimeJS(transformed.transformTime)
      } catch (e) {

      } finally {
        setTransformingJS(false)
      }
      db.setItem('js', value)
    }

    async function updateCSSFromEditor() {
      const value = cssEditor.getModel().getValue()
      setTransformingCSS(true)
      try {
        const transformed = await transformCSS(value)
        setTransformedCSS(transformed.css)
        setTransformTimeCSS(transformed.transformTime)
      } catch (e) {

      } finally {
        setTransformingCSS(false)
      }
      db.setItem('css', value)
    }

    updateJSFromEditor()
    updateCSSFromEditor()

    jsEditor.onDidChangeModelContent(throttle(e => {
      updateJSFromEditor()
    }, 1500, { leading: false }))

    cssEditor.onDidChangeModelContent(throttle(e => {
      updateCSSFromEditor()
    }, 1500, { leading: false }))
  }

  React.useLayoutEffect(() => {
    init()
  }, [])

  const previewiframe = React.useMemo(() => {
    return <iframe title="preview" srcDoc={makeHTML(transformedCSS, transformedJS)}></iframe>
  }, [transformedCSS, transformedJS])

  return (
    <Flex height="100vh" flexDirection="column">
      <Flex p={4} shadow="sm" as="nav">
        <Box mr={4}>
          <Text fontWeight="bold">ESbin</Text>
        </Box>

        <Spacer />

        <Box>
          <Link href="https://github.com/djyde/esbin">GitHub</Link>
        </Box>
      </Flex>

      <Flex flex="1">
        <Flex flexDirection="column" flex="1" borderRight='1px' borderColor="gray.200">
          <Flex p={2} >
            <Box fontWeight="bold">CSS</Box>
            <Spacer />
            <Box>
              {transformingCSS &&
                <Image boxSize={6} src={loading}></Image>}

              {!transformingCSS && transformTimeCSS !== 0 && <Text fontSize="sm" as="span" ml={4}>{transformTimeCSS.toFixed(2)}ms</Text>}

            </Box>
          </Flex>
          <Box flex="1" height="100%" ref={$cssEditor} className="css-editor">

          </Box>
        </Flex>
        <Flex flexDirection="column" flex="1" borderRight='1px' borderColor="gray.200">
          <Flex p={2}>
            <Box fontWeight="bold">JavaScript (Babel)</Box>
            <Spacer />
            <Box>
              {transformingJS &&
                <Image boxSize={6} src={loading}></Image>}

              {!transformingJS && transformTimeJS !== 0 && <Text as="span" ml={4} fontSize="sm">{transformTimeJS.toFixed(2)}ms</Text>}
            </Box>
          </Flex>
          <Box flex="1" height="100%" ref={$jsEditor} className="js-editor">
          </Box>
        </Flex>

        <Box flex="1">
          {previewiframe}
        </Box>

      </Flex>
    </Flex>
  );
}

