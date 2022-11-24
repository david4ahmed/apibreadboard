import axios, { } from 'axios';


export const sendRequest = (syncronous: boolean, baseURL: string, simpleReq: any, event: Electron.IpcMainEvent) => {

    let axiosParams: any = {};
    let axiosHeaders: any = {};
    let axiosBodies: any = {};
    let axiosPath: string = "";

    simpleReq.query?.forEach((element: any) => {
        const key: string = element.key;
        const value: string = element.value;
        axiosParams[key] = value;
    });

    simpleReq.header?.forEach((element: any) => {
        const key: string = element.key;
        const value: string = element.value;
        axiosHeaders[key] = value;
    });

    simpleReq.body?.forEach((element: any) => {
        if(element.mode == 'raw') {
            axiosBodies = element.value;
        } else {
            const key: string = element.key;
            const value: string = element.value;
            axiosBodies[key] = value;
        }
    });
    
    simpleReq.path?.forEach((element: any) => {
        if (typeof element == 'string') {
            axiosPath += element + '/';
        } else {
            axiosPath += element.value + '/';
        }
    });

    //console.log("<<<<<<<<<<<<<<<<<<<<<<<<", axiosBodies);
    //auth[key] = simpleReq.auth?.value;

    axios.request({

        method: simpleReq.method,
        url: axiosPath,
        baseURL: baseURL,
        params: axiosParams,
        headers: axiosHeaders,
        data: axiosBodies,

        //responseType: 'json',
    }).then(function (resp) {
        if (syncronous)
            event.returnValue = { err: false, data: resp.data, status: resp.status };
        else event.sender.send('send-request-response', [resp.data, resp.status]);
        //   console.log("<<<<printing resp data", resp.data);
        //   console.log("<<<<printing status", resp.status);

    }).catch(function (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (syncronous)
                event.returnValue = { err: true, data: error.response.data, status: error.response.status};
            else event.sender.send('send-request-error', [error.response.data, error.response.status]);
            //   console.log("<<<<printing error response.data",error.response.data);
            //   console.log("<<<<printing error response.status", error.response.status);
            //   console.log("<<<<printing error response.header", error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            if (syncronous)
                event.returnValue = { err: true, data: error.request, status: 0 };
            else event.sender.send('send-request-error', [error.request, 0]);
            //console.log("<<<<printing error request", error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            if (syncronous)
                event.returnValue = { err: true, data: error.message, status: 0 };
            else event.sender.send('send-request-error', [error.message, 0]);
            //console.log('Error', error.message);
        }
        if (syncronous)
            event.returnValue = { err: true, data: error.config, status: 0 };
        else event.sender.send('send-request-error', [error.config, 0]);
        //console.log(error.config);
    });

}