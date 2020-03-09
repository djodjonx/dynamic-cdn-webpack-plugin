# webapck-dynamique-cdn-plugin
<div align="center">
  <a href="https://github.com/webpack/webpack">
    <img width="200" height="200"
      src="https://webpack.js.org/assets/icon-square-big.svg">
  </a>

  <h1>Webpack Dynamic CDN Plugin</h1>
  <div align="center">
    <h3>Build Once, run it everywhere.</h3>
  </div>
  <p>Plugin for rewrite, at runtime, webpack assets url for loading application from CDN dynamicaly</p>
</div>
<h2 align="center">Install</h2>

```bash
  npm i --save-dev webpack-dynamic-cdn-plugin
```

```bash
  yarn add --dev webpack-dynamic-cdn-plugin
```



This is a [webpack](http://webpack.js.org/) plugin that help you loading `webpack` bundles from CDN dynamicaly. This plugin work with [HTMLWebpackPlugin](https://github.com/jantimon/html-webpack-plugin).

## Why

Sometimes you need to deliver your code to different environments without wanting to re-build it. But the assets problem on cdn forces you to. With this plugin, all your assets will be loaded from your CDN (s) in a simple way,
you only need to inject into your index.html from your server, a global variable which will contain the url of your cdn. **Build once, run it everywhere!**


## Usage

### Font side webpack conf

Require the plugin in your webpack config:

```javascript
const WebpackDynamicCdnPlugin = require('webpack-dynamic-cdn-plugin');
```

Add the plugin to your webpack config as follows:

```javascript
plugins: [
    new HtmlWebpackPlugin(),
    new WebpackDynamicCdnPlugin('my_awesome_var')
]
```

The plugin take a option variableName => String__. If you don't add this option, it's `__webpack_public_path__` by default.

All variables are bind to __window__

### On server side

This is only an example for commons use cases, please refer to the __server / proxy__ documentation to be able to perform this action.

> Apache proxy with Module Apache mod_substitute

```xml
<Location "/">
    AddOutputFilterByType SUBSTITUTE text/html
    Substitute "s|<head>|expr=<head><script type="text/javascript">window.__webpack_public_path__ = "%{YOUR_URL_FROM_ENV_VAR}"</script>|i"
</Location>
```

> Nginx proxy with ngx_http_sub_module

```bash
location / {
    sub_filter '<head>'  '<head><script type="text/javascript">window.__webpack_public_path__ = "$YOUR_URL_FROM_ENV_VAR"</script>';
    sub_filter_once on;
}
```


## Contribution

You're free to contribute to this project by submitting issues and/or pull requests.

## License

This project is licensed under [MIT](https://github.com/djodjonx/webpack-dynamic-cdn-plugin/blob/master/LICENSE).
