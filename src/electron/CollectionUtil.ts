import { RequestAuth, Variable, Item, Request, FormParam, QueryParam } from "postman-collection";

class CollectionUtil {
    static authHandler = (auth : RequestAuth, simpleRequest : any) => {
        /******** making assumption that the indices for auth array always point to the same type of object */

        //console.log("REQ IS",auth);
        const authType : string = auth?.type;
        const simpleAuth : any = {};
        const simpleAuth2 : any = {};
        const parameters = auth.parameters();

        switch(authType){
            case "apikey" :
                
                //console.log(parameters.get('members'));
                //console.log(parameters.get('in'));
                if(parameters.get('in') == 'query'){
                    
                    simpleAuth.key = parameters.get('key');
                    simpleAuth.value = parameters.get('value');
                    simpleAuth.description = parameters.get('description');
                    simpleRequest.query.push(simpleAuth);
                } else {
                    simpleAuth.key = parameters.get('key');
                    simpleAuth.value = parameters.get('value');
                    simpleAuth.description = parameters.get('description');
                    simpleRequest.header.push(simpleAuth);
                }


                //console.log("<><><><><><><><><><><><><><><>",auth.parameters());
                break;
            case "bearer":
                parameters.each((item: Variable) => {
                    simpleAuth.key = "Authorization";
                    simpleAuth.value = item.value;
                    simpleAuth.description = item.description;
                });
                
                simpleRequest.header.push(simpleAuth);
                break;

            case "basic":
                //console.log("<<<<<<<<<<<<<<<<basic params",parameters);
                parameters.each((item : Variable) => {
                    if(item.key == "username") {
                        
                        simpleAuth.key = item.key;
                        simpleAuth.value = item.get();
                        simpleRequest.header.push(simpleAuth);

                    } else if(item.key == "password") {
                        simpleAuth2.key = item.key;
                        simpleAuth2.value = item.get();
                        simpleRequest.header.push(simpleAuth2);
                    }
                // console.log("<<<<<<<<<<<header", simpleRequest.header);
                });
                //console.log("<<<<<<<<<<<header", simpleRequest.header);

                //console.log(">>>>>>>key", simpleRequest.header);

                break;
            
                //TODO implement other types later
        }
        
    };
  
    static parseQueries = (req : Request, simpleRequest : any) => {
        req.url.query.each(param => {
            const description = typeof param.description == 'string'? param.description : param.description?.content;
            simpleRequest.query.push({"key" : param.key, "value" : param.value, "description" : description});
        });
    }

    static parseBodies = (req : Request, simpleRequest : any) => {
        if(req.body?.isEmpty() == false){
            var mode = req.body?.mode;
            const description = typeof req.body?.description == 'string'? req.body?.description : req.body?.description?.content;
            switch(mode){
                case "urlencoded":
                    req.body?.urlencoded?.each((param : QueryParam) => {
                        const description = typeof param.description == 'string'? param.description : param.description?.content;
                        simpleRequest.body.push({"mode": mode, "key": param.key, "value": param.value, "description": description});
                    });
                    break;

                case "raw":
                    simpleRequest.body.push({"mode": mode, "key": "raw", "value": req.body?.raw, "description": description})
                    break;

                case "formdata":
                    req.body?.formdata?.each((param : FormParam) => {
                        const description = typeof param.description == 'string'? param.description : param.description?.content;
                        // Ket is not actually a part of raw body, but included for compatibility
                        // with frontend code
                        simpleRequest.body.push({"mode": mode, "key": "raw", "value": param.value, "description": description});
                    });
                    break;

                // case "file":
                //     simpleRequest.body.push({"mode": mode, "value": req.body?.file, "description": description})
                // break;
                // case "graphql":
                //     console.log(req.body?.mode);
                //     console.log(req.body?.graphql);
                // break;
            }
        }
    }

    static buildSimpleRequest = (item : Item, RID : number, globalAuth? : RequestAuth) => {
        const newRequest : any = {};
        const req = item.request;
        const resp = item.responses;
        newRequest.response = undefined;

        resp.each(response => {
            if(response.code == 200 && response.body){
                //console.log("this is the response", response);
                try {
                    newRequest.response = JSON.parse(response.body);
                    if(Array.isArray(newRequest.response)){
                        newRequest.response = newRequest.response[0];
                    }
                } catch {
                    // Do nothing cause response failed.
                }
            }
        });

        newRequest.RID = RID;

        // Find basic universal info for each request
        
        //console.log("<<<<printing req", element);
        newRequest.requestName = item.name;
        newRequest.method = req.method;
        //newRequest.path = req.url.path;
        newRequest.description = req.description;

        newRequest.header = req.headers.all();
        newRequest.query = [];
        newRequest.body = [];

        const pathArray = req.url.path;
        const getPathRet = req.url.getPath();

        newRequest.path = formPathArray(pathArray, getPathRet);
        
        if(req.auth != undefined) {
            CollectionUtil.authHandler(req.auth, newRequest);
        } else if(globalAuth != undefined) {
            CollectionUtil.authHandler(globalAuth, newRequest);
        }

        switch(req.method) {
            case "POST":
            case "PUT":
            case "DELETE":
            case "PATCH":
            case "OPTIONS":
            case "HEAD":
                CollectionUtil.parseBodies(req, newRequest);

            case "GET":
                CollectionUtil.parseQueries(req, newRequest);
                break;
        }
        return newRequest;
    }
}

export default CollectionUtil;



function formPathArray(pathArray: string[] | undefined, getPathRet: string): any {
    
    // pet/<long>/<string>
    let pathWithTypes = getPathRet.split('/');
    let resultArray = [];

    if(pathArray){
        for(let i = 0; i < pathArray.length; i++){
            if(pathArray[i][0] == ':'){
                //resolved = resolved.replace(/<(.*?)>/, "{" + pathArray[i] + " [$1]}");
                resultArray.push({key: pathArray[i].substring(1), value: pathWithTypes[i]});
            } else {
                resultArray.push(pathArray[i]);
            }
        }
       
    }

    return resultArray;
    
}
// .path : [pet, :petID]

// .getPath: pet/<long>


// {:petid: <long>}

// pathurl: pet/{:petID: |long|}

// pet/{}/
