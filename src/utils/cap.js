// create app container
import mime from 'mime'

  function getAppContainerPage(app){
    function getIcon(app){
      if(app.icoUrl !== ''){
        return {
          url:'./root' + app.icoUrl,
          type:mime.getType(app.icoUrl)
        };
      }
      if(app.iconUrl !== ''){
        return {
          url:app.iconUrl,
          type:mime.getType(app.iconUrl)
        };
      }
      return {
        url:'./favicon.ico',
        type:'image/png'
      }
    }

    var icon = getIcon(app)

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="manifest" href="./manifest.json" />
      <link rel="icon" href="${icon.url}" type="${icon.type}"/>
      <title>${app.name}</title>
    </head>
    <body>
      <iframe id="container" src="./root${app.startup}"></iframe>
    </body>
    <style>
      html, body, #container{
        height: 100%;
        width: 100%;
        margin: 0;
        border: 0;
      }
    </style>
    <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('../../../sw.js',{scope:'./root${app.startup}'});
    }
    </script>
    </html>
    `
  }
  function getAppContainerManifestJson(app){
    return `
    {
      "short_name": "${app.name}",
      "name": "${app.name}",
      "icons": [

        {
          "src": ${(app.iconUrl==='')?`"./logo192.png"`:`"./root${app.iconUrl}"`},
          "type": "image/png",
          "sizes": "256x256 192x192 128x128 64x64 32x32 24x24 16x16"
        }
      ],
      "start_url": "./index.html",
      "display": "standalone",
      "theme_color": "#000000",
      "background_color": "#ffffff"
    }
    
    `
  }
  // ${(app.icoUrl==='')?`"/favicon.ico"`:`"./root${app.icoUrl}"`}
  // 


  export default {getAppContainerPage,getAppContainerManifestJson}


