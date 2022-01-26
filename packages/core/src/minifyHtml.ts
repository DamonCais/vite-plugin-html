import type { Plugin } from 'vite'
import type { Options as MinifyOptions } from 'html-minifier-terser'
import { minify as minifyFn } from 'html-minifier-terser'
import { htmlFilter } from './utils/createHtmlFilter'

function getOptions(minify: boolean): MinifyOptions {
  return {
    collapseWhitespace: minify,
    keepClosingSlash: minify,
    removeComments: minify,
    removeRedundantAttributes: minify,
    removeScriptTypeAttributes: minify,
    removeStyleLinkTypeAttributes: minify,
    useShortDoctype: minify,
    minifyCSS: minify,
  }
}

export async function minifyHtml(
  html: string,
  minify: boolean | MinifyOptions,
) {
  if (typeof minify === 'boolean' && !minify) {
    return html
  }

  let minifyOptions: boolean | MinifyOptions = minify

  if (typeof minify === 'boolean' && minify) {
    minifyOptions = getOptions(minify)
  }

  return await minifyFn(html, minifyOptions as MinifyOptions)
}

export function createMinifyHtmlPlugin(
  minifyOptions: MinifyOptions | boolean = true,
): Plugin {
  return {
    name: 'vite:minify-html',
    apply: 'build',
    enforce: 'post',
    async generateBundle(_, outBundle) {
      if (minifyOptions) {
        for (const bundle of Object.values(outBundle)) {
          if (
            bundle.type === 'asset' &&
            htmlFilter(bundle.fileName) &&
            typeof bundle.source === 'string'
          ) {
            bundle.source = await minifyHtml(bundle.source, minifyOptions)
          }
        }
      }
    },
  }
}
