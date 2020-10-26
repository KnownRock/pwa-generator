importScripts('./mime.js')

const HEAD = 'http://localhost:3000/apps/'
const START_URL_INDEX = HEAD.length
const REGEX_GET_APP_ID = /^[^/]*/

function getAppId(url){
  if(url.indexOf(HEAD)===0 && url.length>START_URL_INDEX){
    var partUrl = url.slice(START_URL_INDEX)
    var m = partUrl.match(REGEX_GET_APP_ID)
    var name = m && m[0]
    return name
  }else{
    return null
  }
}

async function installApp(app){
  await caches.delete(app.id)
  
  caches.open(app.id).then(function(cache){
    app.directFileList.forEach(async el => {
      var type = mime.getType(el.path)
      function isImage(type){
        return  type.split('/')[0] === 'image';
      }
      if(isImage(type)){
        var xxx = await fetch(el.content)
        // xxx.headers.append('Content-Type',type)
        cache.put(`${el.path}`, new Response(
          xxx.body,{
            headers: {'Content-Type': type}
          }
        ))
        return
      }

      cache.put(`${el.path}`,new Response(el.content,{
        headers: {'Content-Type': el.contentType}
      }))
    });
  })

}

/* Start the service worker and cache all of the app's content */
// self.addEventListener('install', function(e) {
//   console.log('install',e);
// });

self.addEventListener('message',async function(e){
  
  if(e.data.type == 'update'){
    var app = e.data.app
    await installApp(app)
 
    e.source.postMessage({
      type:'update',
      msg:'done'
    });

  }
  if(e.data.type == 'getAppIds'){
    var xx = await caches.keys()
    e.source.postMessage({
      type:'getAppIds',
      value:xx
    });
  }

  if(e.data.type == 'delApp'){
    var id = e.data.id
    await caches.delete(id)

    e.source.postMessage({
      type:'getAppIds',
      msg:'done'
    });
  }
 
})

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
  var url = e.request.url

  if(url +'/' === HEAD){
    if(e.request.method === 'GET'){
      return e.respondWith(new Promise(async res=>{
        var xx = await caches.keys()
        res  (new Response(JSON.stringify(xx)))
      }) )
      
    }
  }

  var appId = getAppId(url)
  if(appId !== null && appId !==''){

    e.respondWith(new Promise(async res=>{
      if(url === HEAD+appId){
        if(e.request.method === 'DELETE'){
          await caches.delete(appId)
          return res(new Response(JSON.stringify({'ok':1})))
        }
      }
      
      var isCached = await (caches.has(appId))
      if(!isCached) return new Response('app not inited',{
        status:'404'
      })

      caches.open(appId).then(cache=>{
        if(url === HEAD + `${appId}/logo192.png`){
          return res(fetch('/logo192.png'))
        }
        if(url === HEAD + `${appId}/favicon.ico`){
          return res(fetch('/favicon.ico'))
        }
        
        cache.match(e.request).then(function(response) {
          res( response )
        })
      })
    }));
  }else{
    e.respondWith(fetch(e.request)) 
  }
});
