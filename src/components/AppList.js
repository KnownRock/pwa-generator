import React,{useState,useEffect} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Avatar from '@material-ui/core/Avatar';
import AppsIcon from '@material-ui/icons/Apps';
// import GetAppIcon from '@material-ui/icons/GetApp';
import GetAppIcon from '@material-ui/icons/GetApp';
import BeachAccessIcon from '@material-ui/icons/BeachAccess';
import notifyService from '../utils/notifyService'
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export default function FolderList(props) {
  const classes = useStyles();
  const {getHandleClickOpen} = props

  const [currentAppId,setCurrentAppId]= useState("default")
  const [appIds,setAppIds] = useState([])

  // const [delApp,setDelApp] = useState(_=>{
  //   console.error('del app fuc init error');
  // })

  const [changed,setChanged] = useState(uuidv4())

  useEffect(() => {
    (async _=>{
      // debugger
      var xx = await (await fetch(`./apps`)).json()
      setAppIds(xx)

      if (navigator.serviceWorker) {
        navigator.serviceWorker.addEventListener('message',async event => {
          if(event.data.type === 'update'){
            var xx = await (await fetch(`./apps`)).json()
            setAppIds(xx)
          }
        })
      }
    })()

    // if (navigator.serviceWorker) {
    //   navigator.serviceWorker.addEventListener('message', event => {
    //     if(event.data.type === 'getAppIds'){
    //       console.log(event.data.value);
    //       setAppIds(event.data.value)
    //     }
        
    //   });
    //   navigator.serviceWorker.ready.then( registration => {
    //     registration.active.postMessage({
    //       type:'getAppIds',
    //     });
    //   });
    // }
  }, [changed])

  function AppListItem(props){
    const {id} = props

    console.log(id);

    const [meta,setMeta] = useState({
      id,
      name:'--'
    })

    // const [deleted,setDeleted] = useState(false)

    useEffect(_=>{
      // if(deleted) return
      // console.log(id);
      (async _=>{
        var meta = await (await fetch(`./apps/${id}/info.json`)).json()
        setMeta(meta)
      })()

      return ()=>{
        setMeta([])
      };
    },[])

    return (
      <ListItem key={id}>
        <ListItemAvatar>
          <Avatar>
            <AppsIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={meta.name} secondary={meta.id} />
        <ListItemSecondaryAction>
          <IconButton edge="end" color="primary" aria-label="download" onClick={async _=>{
            window.open(`./apps/${id}/index.html`)
            }}>
              <PlayCircleFilledIcon />
            </IconButton>
          <IconButton edge="end" color="primary" aria-label="download" onClick={async _=>{
            var text = await (await fetch(`./apps/${id}/meta.json`)).json()
            var fileBlob = new Blob([JSON.stringify(text) ], {type: "application/octet-binary"});

            var link = document.createElement("a");
            link.setAttribute("href", URL.createObjectURL(fileBlob));
            link.setAttribute("download", `${meta.name}.pwp`);
            link.appendChild(document.createTextNode("Save file"));
            link.click()
          }} >
            <GetAppIcon />
          </IconButton>
          <IconButton edge="end" color="primary" aria-label="edit" onClick={getHandleClickOpen(id)}>
            <EditIcon />
          </IconButton>
          <IconButton edge="end" color="secondary" aria-label="delete" onClick={async _=>{
            // delApp(id) 

            await fetch(`./apps/${id}`,{
              method:'Delete'
            })
            notifyService.success('删除成功')
            
            setChanged(uuidv4())
      
            
          }}>
            <DeleteIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
      // window.open(`./apps/${appId}/index.html`)
    )
  }

  return (
    <List className={classes.root}>
      {appIds.map(el=>{
        return (
          <AppListItem id={el} key={el}></AppListItem>
        )
      })}
      
      
    </List>
  );
}
