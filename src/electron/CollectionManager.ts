import { Collection, Request, Item, ItemGroup, PropertyList } from 'postman-collection';
import { app } from 'electron';
import { BorderAll } from '@material-ui/icons';
import CollectionUtil from './CollectionUtil';
const Store = require('electron-store');

class CollectionManager {
    private collections = new Map<number, Collection>();
    private requests = new Map<number, Array<Request>>();
    store = new Store({'name': 'collectionData'});

    /* Adding imported collection to the collections array */
    addCollection(collection : Collection) {
        let CID = this.generateCID();
        this.collections.set(CID, collection);
        this.requests.set(CID, new Array<Request>());
        
        console.log("collectionsss", collection);
        return this.collectionToSimple(CID);
    }

    deleteCollection(sender: Electron.WebContents, collectionID: number) {
        if(this.collections.has(collectionID) == false){
            //console.log("id doesnt exist");
            sender.send("delete-colletion-error", "delete failed= CID doesnt exist");
        } else {
            this.store.delete(collectionID.toString());
            this.collections.delete(collectionID);
            this.requests.delete(collectionID);
            console.log("deletion happened?");
            sender.send("delete-colletion-error", "delete was successful");
        }
    }

    private generateCID() {
        do {
            var x = Math.floor(Math.random() * (10 ** 15));
        } while(this.collections.has(x));
        return x;
    }

    private iterateItems(list : PropertyList<Item | ItemGroup<Item>>, simpleCollection : any, collection : Collection) {
        const tagObject : any = {};
        // Warning: Potential bug here if "requests" is the name of a tag
        tagObject.requests = [];

        list.each(element => {
            if(Item.isItem(element)) {
                const item = element as Item;
                const req = item.request;
                const auth = item.getAuth() || collection.auth;
               
                this.requests.get(simpleCollection.CID)!.push(req);
                const newRequest = CollectionUtil.buildSimpleRequest(item, simpleCollection.numRequests++, auth);

                //We're gonna set the baseURL here since we may need to extract it from a request
                if(simpleCollection.baseURL == undefined) {
                    ////console.log("DEBUG: Setting baseURL");
                    var baseURL : string = (req.url.protocol ? req.url.protocol + '://' : 'https://') + req.url.getHost();
                    ////console.log(baseURL)
                    // Check if baseURL matches the regex for a variable
                    var match = /^{{(\w+)}}$/.exec(req.url.getHost());
                    if(match != null) {
                        var varName : string = match[1];
                        simpleCollection.baseURL = collection!.variables.get(varName);
                    } else {
                        // If not, directly set the baseURL
                        simpleCollection.baseURL = baseURL;
                    }
                }

                tagObject.requests.push(newRequest);
            } else {
                const itemGroup = element as ItemGroup<Item>;
                const childObject = this.iterateItems(itemGroup.items, simpleCollection, collection);
                tagObject[itemGroup.name] = childObject;
            }
            //this.iterateItems(itemGroup);
            // console.log(itemGroup.name);
            // itemGroup.forEachItem(item => {
            //     console.log("\t" + item.name);
            // })
        });

        return tagObject;

/*
        requests: {
            pet: {
                coolpet: {
                    dog:{

                    }
                    [
                        {   
                            reqName
                            descri
                            method
                        ...
                        }
                        {   
                            reqName
                            descri
                            method
                        ...
                        }
                        {   
                            reqName
                            descri
                            method
                        ...
                        }
                    ]
                }
            }
        }/
        */
    }


    // private getWrapper(collections: Map<number,Collection>, CID : number){
    //     const collection = this.collections.get(CID);
    //     if(typeof collection == 'undefined'){
    //         alert('collection with this CID doesnt exist');
    //     } else {
    //         return collection;
    //     }
    // }
    collectionToSimple(CID : number){
        /* each element is a request pulled from the structure */
        
        const simpleCollection : any = {};
        const collection = this.collections.get(CID);

        simpleCollection.collectionName = collection!.name;
        simpleCollection.CID = CID;
        simpleCollection.auth = collection!.auth;
        simpleCollection.numRequests = 0;

        // Iterate over every request item in collection
        simpleCollection.tags = this.iterateItems(collection!.items, simpleCollection, collection!);
        simpleCollection.tags = this.iterateItems(collection!.items, simpleCollection, collection!);

        //console.log("this is the simple collection", simpleCollection);
        //console.log(simpleCollection.requests.query);
        return simpleCollection;
    }

    /*make IPC call to send list of simpleCollections to front-end*/
    getCollections() {
        
        let set = new Set();
        let simpleCollectionList = new Array();

        // for(let i = 0; i < this.collections.size; i++){
        //     //if(set.has(this.collections[i].id) == false){
        //     const simpleCollection = this.collectionToSimple(i);
        //     simpleCollectionList.push(simpleCollection);
        //     //set.add(this.collectionToSimple(simpleCollection));
        //     //}
        // }

        this.collections.forEach((value, key) => {
            const simpleCollection = this.collectionToSimple(key);
            simpleCollectionList.push(simpleCollection);
        });
        //console.log(simpleCollectionList);

        return simpleCollectionList;
    }

    /* reads collections from stored JSON file and imports back into collections array */
    readCollections() {
       
        const storeObject : Object = this.store.store;
        for(let key of Object.keys(storeObject)) {
            //console.log("printing storeObject", key);
            const CID = this.generateCID();
            //console.log(CID);
            this.collections.set(/*CID*/ +key, new Collection(this.store.get(key)));
            this.requests.set(/*CID*/ +key, new Array<Request>()); 
        }
    }

    /* saves collections array in JSON file */
    saveCollections() {
        let i = 0;
        this.collections.forEach((value, key) => {
            this.store.set(key.toString(), value);
            console.log("Looookkkk", key);
            i++;
        });
        //this.collections.entries().
        //console.log(this.store.get(''));
    }

    getRequestByID(CID: number, RID : number) {   
        const requestList = this.requests.get(CID);
        if(requestList != undefined){
            return requestList[RID];
        }
    }
}

export const collectionManager = new CollectionManager();

/*var simpleCollection = {
            collectionName : "",
            baseURL : "",
            requests : [
                {
                    method : "GET",
                    requestName : "",
                    path : "",    
                    query: [{key: "", value: ""}]
                },
                {
                    method : "POST",
                    requestName : "",
                    path : "",
                    query: [{key: "", value: ""}],
                    body : [{key: "", value: ""}]
                },
                {
                    requestName : "",
                    path : "",
                    method : "PUT",
                    query: [{key: "", value: ""}],
                    body : [{key: "", value: ""}]
                }
                // {
                //     requestName : "",
                //     path : "",
                //     method : "DELETE",
                //     body : [{key: "", value: ""}] 
                // },
                // {
                //     requestName : "",
                //     path : "",
                //     method : "PATCH",
                //     body : [{key: "", value: ""}]
                // },
            ]
        };*/