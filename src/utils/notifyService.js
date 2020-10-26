
import React,{useEffect} from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidv4 } from 'uuid';

import Button from '@material-ui/core/Button';
import { SnackbarProvider, useSnackbar } from 'notistack';

var service = {
  success(msg){},
  error(msg){},
  warning(msg){},
  notify(msg){},
  info(msg){}
}

const defaultSetting = {
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'center',
  },
  autoHideDuration: 3000,
}

function MyApp() {
  const { enqueueSnackbar } = useSnackbar();
  service.notify = (msg)=>{
    enqueueSnackbar(msg, { ...defaultSetting, variant:'default' });
  }
  ['success','error','warning','info'].forEach(el=>{
    service[el] = (msg)=>{
      enqueueSnackbar(msg, { ...defaultSetting,variant:el });
    }
  })


  return (
    <React.Fragment></React.Fragment>
  );
}


var div = document.createElement('div')
document.body.append(div)
ReactDOM.render(<SnackbarProvider maxSnack={3}>
  <MyApp />
</SnackbarProvider>,div)

export default service