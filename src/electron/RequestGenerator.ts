import { Request } from 'postman-collection'
const codegen = require('postman-code-generators')

class RequestGenerator {
    mergeRequest = (baseURL : string, simpleReq : any, req : Request) : Request => {
        // TODO: Implement mergin simpleRequest with postman request
        const newReq = req.clone();

        // We shouldn't need to define auth since we insert auths into header/body
        newReq.auth = undefined;

        // This line shouldn't be needed in practice
        //newReq.method = simpleReq.method;

        // Merge path and baseURL
        let url = baseURL;
        simpleReq.path?.forEach((element: any) => {
            if(typeof element == 'string'){
                url += element + '/';
            } else {
                url += element.value + '/';
            }
        });

        // Overwrite old url with new one
        newReq.url.update(url);

        // Merge query parameters
        newReq.url.addQueryParams(simpleReq.query);

        // Merge headers
        simpleReq.header.forEach((header : any) => {
            newReq.headers.upsert(header);
        });

        // Merge body params
        if(newReq.body) {
            switch(simpleReq.body.mode) {
                case "urlencoded":
                    newReq.body.urlencoded?.assimilate(simpleReq.body.value, false);
                    break;

                case "raw":
                    newReq.body.raw = simpleReq.body.value;
                    break;

                case "formdata":
                    newReq.body.formdata?.assimilate(simpleReq.body.value, false);
                    break;

                case "file":
                    newReq.body.file = simpleReq.body.value;
                    break;
            }
        }


        return newReq;
    }

    generateRequest = (key: string, variant: string, req : Request, callback : (error : any, snippet : string) => any) => {
        codegen.convert(key, variant, req, {}, callback);
        //codegen.convert('nodejs', 'request', req, {}, callback);
    }
}

export const requestGenerator = new RequestGenerator();