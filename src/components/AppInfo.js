
import List from '@material-ui/core/List';
import TextField from '@material-ui/core/TextField';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Dialog from '@material-ui/core/Dialog';
import Avatar from '@material-ui/core/Avatar';
import {useDropzone} from 'react-dropzone'
import React, { useEffect ,useState, useCallback}  from 'react';
import ImageIcon from '@material-ui/icons/Image';
import StyledDropzone from './StyledDropzone'
import Fab from '@material-ui/core/Fab';
import PlayArrow from '@material-ui/icons/PlayArrow';
import NavigationIcon from '@material-ui/icons/Navigation';
import { Button } from '@material-ui/core';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import mime from 'mime'
import cap from '../utils/cap'
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SaveIcon from '@material-ui/icons/Save';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import notifyService from '../utils/notifyService'
// SaveIcon
// PlayCircleFilledIcon
export default function AppInfo(props){

  const [name, setName] = useState('')
  const [startup,setStartup] = useState('')
  const [icoUrl,setIcoUrl] = useState('')
  const [iconUrl,setIconUrl] = useState('')

  const appInfoConfig = [{
    title:'程序名称',
    value:name,
    setValue:setName
  },{
    title:'起始文件Url',
    value:startup,
    setValue:setStartup
  },{
    title:'图标ico Url (ico)',
    value:icoUrl,
    setValue:setIcoUrl
  },{
    title:'PWA 图标url (png)',
    value:iconUrl,
    setValue:setIconUrl
  }]

  const [fileList, setFileList] = useState([])
  const [type, setType] = useState('file')
  const {onClose,appId} = props


  async function save(){
    new Promise(async (resolve)=>{
      var app = {
        id:'test',
        name:'',
        startup:'',
        fileList:[]
      }
      
      async function getFileInfo(file){
        return new Promise((res)=>{
          var reader = new FileReader()
          reader.onload = (e)=>{
            res({
              name:file.name,
              path:file.path,
              content:e.target.result
            })
          }
          var type = mime.getType(file.path)
          function isImage(type){
            return  type.split('/')[0] === 'image';
          }
          if(isImage(type)){
            reader.readAsDataURL(file)
          }else{
            reader.readAsText(file)
          }

          
          
        });      
      }
  
      app.id = appId
      app.name = name
      app.startup = startup
      app.icoUrl = icoUrl
      app.iconUrl = iconUrl
  
      if(type === 'file'){
        var files = await Promise.all(fileList.map(getFileInfo))
      }else{
        var files = fileList
      }
      
      app.fileList = files
      
      files = files.map(el=>{
        return {
          ...el,
          path:`./apps/${app.id}/root${el.path}`,
          contentType:mime.getType(el.path)
        };
      })
      files.push({
        name:'meta.json',
        path:`./apps/${app.id}/meta.json`,
        content:JSON.stringify(app),
        contentType:mime.getType('meta.json')
      })
  
      var info = {...app}
      delete info.fileList
      files.push({
        name:'info.json',
        path:`./apps/${app.id}/info.json`,
        content:JSON.stringify(info),
        contentType:mime.getType('info.json')
      })
      files.push({
        name:'index.html',
        path:`./apps/${app.id}/index.html`,
        content:cap.getAppContainerPage(app),
        contentType:mime.getType('index.html')
      })
      files.push({
        name:'index.html',
        path:`./apps/${app.id}/manifest.json`,
        content:cap.getAppContainerManifestJson(app),
        contentType:mime.getType('manifest.json')
      })
  
      app.directFileList = files
  
      
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', event => {
          if(event.data.type === 'update'){
            // window.open(`./apps/${app.id}/index.html`)
            resolve(1)
          }
        });
        navigator.serviceWorker.ready.then( registration => {
          console.log('app',app);
          registration.active.postMessage({
            type:'update',
            app
          });
        });
      }
      
    })
  }
  function start(){
    window.open(`./apps/${appId}/index.html`)
  }

  // async function onStart(){
  //   await save()
  //   window.open(`./apps/${appId}/index.html`)
  // }

  useEffect(_=>{
    (async _=>{
      var meta = await (await fetch(`./apps/${appId}/meta.json`)).json()
      setName(meta.name)
      setType('obj')
      setFileList(meta.fileList)
      setStartup(meta.startup)
      setIcoUrl(meta.icoUrl)
      setIconUrl(meta.iconUrl)
      // debugger
    })()
    
  },[])


  return (
    <div>
      <AppBar position="fixed" >
        <Toolbar>
            <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" style={{width:'100%'}} >
              {name}
            </Typography>
            <IconButton aria-label="save" color="inherit" title="保存" onClick={async _=>{
              await save()
              notifyService.success('保存成功')
            }}>
              <SaveIcon />
            </IconButton>
            <IconButton aria-label="save" color="inherit" title="启动" onClick={async _=>{
              start()
            }}>
              <PlayCircleFilledIcon />
            </IconButton>

            {/* <Button color="inherit" style={{minWidth:'100px'}} onClick={async _=>{
              await save()
              start()
            }}>
              保存&启动
            </Button> */}
          </Toolbar>
        </AppBar>
        <div style={{height:'56px'}}></div>
        <div className="App" style={{padding:'1em'}}>
          {appInfoConfig.map((el,index)=>{
            return <TextField key={index}  label={el.title} style={{width:'100%',marginTop:'1em'}} value={el.value} onChange={(e)=>{el.setValue(e.target.value)}} variant="outlined" />
          })}
        {/* <TextField  label="程序名称" style={{width:'100%'}} value={name} onChange={(e)=>{setName(e.target.value)}} variant="outlined" />
        <TextField  label="起始文件Url" style={{width:'100%',marginTop:'1em'}} value={startup}  onChange={(e)=>{setStartup(e.target.value)}} variant="outlined" /> */}

        <div style={{paddingTop:'1em'}}>
          <StyledDropzone onDrop={acceptedFiles => {
            console.log(acceptedFiles)  
            setFileList(acceptedFiles)
            setType('file')
          }}>
            <div style={{width:'100%'}}>
              {
                (_=>{
                  if(!fileList.length){
                    return (
                      <h1 style={{height:'10em',margin:'1em',lineHeight:'10em'}}>文件拖入此处</h1>
                    );
                  }else{
                    return (
                      <div onClick={e=>e.stopPropagation()}>
                        <Button style={{marginTop:'1em'}} variant="contained" color="secondary" onClick={()=>setFileList([])} >
                          清空
                        </Button>
                        <List>
                          {fileList.map(el=>{
                          return(<ListItem key={el.path}>
                            <ListItemAvatar>
                              <Avatar>
                                <h1 style={{fontSize:'100%'}}>
                                  {
                                    el.path.match(/\.([^.]*)$/)&&el.path.match(/\.([^.]*)$/)[1]
                                  }
                                </h1>
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={el.name} secondary={el.path} />
                            {
                              ({
                                html:(
                                  <Button color="primary"  onClick={_=>{setStartup(el.path)}}>
                                  起始页
                                  </Button>),
                                png:(
                                  [<Button color="secondary" onClick={_=>{setIconUrl(el.path)}}>
                                    PWA图标
                                  </Button>,<Button color="secondary" onClick={_=>{setIcoUrl(el.path)}}>
                                    网页图标
                                  </Button>]),
                                ico:(
                                  <Button color="secondary" onClick={_=>{setIcoUrl(el.path)}}>
                                    网页图标
                                  </Button>),
                              })[el.path.match(/\.([^.]*)$/)&&el.path.match(/\.([^.]*)$/)[1]] || <div></div>
                            }
                          </ListItem>)
                          })}
                        
                        </List>
                      </div>
                    ) 
                  }
                })()
              }
            </div>
          </StyledDropzone>
        </div>
      </div>
    </div>
  )
}