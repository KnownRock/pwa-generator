import React,{useEffect,useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';

import Slide from '@material-ui/core/Slide';

import AppInfo from './components/AppInfo'
import AppList from './components/AppList'
import MainBar from './components/MainBar'
import installSw from './utils/installSw'

import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AddIcon from '@material-ui/icons/Add';
import { v4 as uuidv4 } from 'uuid';


const useStyles = makeStyles((theme) => ({
  appBar: {
    position: 'relative',
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function FullScreenDialog() {
  const classes = useStyles();
  const [open, setOpen] = useState(false);

  const getHandleClickOpen = (el) =>{
    const handleClickOpen = () => {
      setCurrentAppId(el)
      setOpen(true);
    };
    return handleClickOpen
  }

  const handleClose = () => {
    setOpen(false);
  };

  const [currentAppId,setCurrentAppId]= useState("default")
  const [appIds,setAppIds] = useState([])

  useEffect(() => {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', event => {
        if(event.data.type === 'getAppIds'){
          setAppIds(event.data.value)
        }
        
      });
      navigator.serviceWorker.ready.then( registration => {
        registration.active.postMessage({
          type:'getAppIds',
        });
      });
    }
  }, [])

  return (
    <div>
      <MainBar>
        <IconButton aria-label="save" color="inherit" title="新增" onClick={_=>{
          getHandleClickOpen(uuidv4())()
        }}>
          <AddIcon />
        </IconButton>
      </MainBar>
      {/* <Button style={{margin:'1em'}} variant="outlined" color="primary" onClick={_=>{}}>新建</Button> */}
      {/* {appIds.map(el=><Button style={{margin:'1em'}} variant="outlined" color="primary" onClick={getHandleClickOpen(el)}>
        {el}
      </Button>)} */}
      <AppList getHandleClickOpen={getHandleClickOpen}></AppList>
      <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
        <AppInfo onClose={handleClose} appId={currentAppId}/>
      </Dialog>
    </div>
  );
}