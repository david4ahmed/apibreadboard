// ( ͡° ͜ʖ ͡°)
const log = console.log
//console.log = function() { log("Nice try :P")};

class Debug {
    static signature : string | undefined = undefined;

    static enableSignature(signature : string) {
        this.signature = signature;
    }

    /* You should maintain the same signature for all your print statements */
    static log(signature : string, ...args: any[]) {
        if(signature == this.signature) {
            log(...args);
        } else if(this.signature === undefined) {
            log("No signature enabled! You need to enable your signature with Debug.enableSignature() to print. Only one signature can be enabled at a time. Set the signature to \"\" to disable this message and all printing.");
        }
    }
}

export default Debug;