/* eslint-disable */
const HtmlWebpackPlugin = require('html-webpack-plugin')

class WebpackDynamicCdnPlugin {

  constructor(windowVar) {
    this.windowVar = windowVar || '__webpack_public_path__'
    this._currentVersion = 3
    this._mapTags = {
      3: {
        head: 'head',
        body: 'body'
      },
      4: {
        head: 'headTags',
        body: 'bodyTags'
      }
    }
  }

  getBodyTagsKey () {
    return this._mapTags[this._currentVersion].body
  }

  getHeadTagsKey () {
    return this._mapTags[this._currentVersion].head
  }

  formatURL (url) {
    if (url.indexOf('/') === 0) {
      // remove first '/' of url
      return url.slice(1)
    }
    return url
  }

  generateHeadTag (tagArray) {
    let tags = []
    tagArray.forEach((tagObject) => {
      const tag = {}
      tag.href = this.formatURL(tagObject.attributes.href)
      if (tagObject.attributes.rel) {
        tag.rel = tagObject.attributes.rel
      }
      if (tagObject.attributes.as) {
        tag.as = tagObject.attributes.as
      }
      tags.push(JSON.stringify(tag))
    })

    const renderHeadFunction =`
    (function() {
      var publicPath = window.${this.windowVar} || '/';
      /** set webpack public path */
      __webpack_public_path__ = publicPath;
      var tags = [${tags}];
      var headTag = document.head;
      tags.forEach((tag) => {
        var link = document.createElement('link');
        link.href = publicPath + tag.href;
        if (tag.rel) {
          link.rel = tag.rel;
        }
        if (tag.as) {
          link.as = tag.as;
        }
        document.head.appendChild(link);
      })
    })(window, document);
    `
    return renderHeadFunction;
  }

  generateBodyTag (tagArray) {
    let tags = []
    tagArray.forEach((tagObject) => {
      const tag = {}
      tag.src =  this.formatURL(tagObject.attributes.src)
      tags.push(JSON.stringify(tag))
    })

    const renderBodyFunction =`
    (function() {
      var publicPath = window.${this.windowVar} || '/';
      var tags = [${tags}];
      var bodyTag = document.body;
      tags.forEach((tag) => {
        var script = document.createElement('script');
        script.src = window.${this.windowVar} + tag.src;
        document.body.appendChild(script);
      })
    })(window, document);
    `
    return renderBodyFunction;
  }

  processingAlterTags (data, cb) {
    const headTag = {
      tagName: 'script',
      closeTag: true,
      attributes: {
        type: 'text/javascript'
      },
      innerHTML: this.generateHeadTag(data[this.getHeadTagsKey()])
    }

    const bodyTag = {
      tagName: 'script',
      closeTag: true,
      attributes: {
        type: 'text/javascript'
      },
      innerHTML: this.generateBodyTag(data[this.getBodyTagsKey()])
    }

    const alteredData = Object.assign({}, data, { body: [bodyTag], head: [headTag] })

    if (cb) {
      cb(null, alteredData)
    } else {
      return Promise.resolve(result)
    }
  }

  plugToHook(compilation) {
    if (compilation.hooks.htmlWebpackPluginAlterAssetTags) {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tapAsync('DynamicCdnPluginAlterAssets', (data, cb) => this.processingAlterTags(data, cb))
    } else if (HtmlWebpackPlugin.getHooks) {
      // HtmlWebPackPlugin 4.x
      this.currentVersion = 4
      let hooks = HtmlWebpackPlugin.getHooks(compilation);
      hooks.alterAssetTags.tapAsync('DynamicCdnPluginAlterAssets', (data, cb) => this.processingAlterTags(data, cb))
    } else {
      compilation.errors.push('HtmlWebpackPlugin not found! \n This plugin work only with HtmlWebpackPlugin')
    }
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('DynamicCdnPluginProcess', (compilation) => {
      this.plugToHook(compilation)
    })
  }
}

module.exports = WebpackDynamicCdnPlugin
