import { TranslationState } from '@/app/store/translation/types'
import {VariablesState} from '@/app/store/variables/types'
import {addNodeCreatedVariable} from '@/app/store/variables/action'

export const evaluateScriptFromState = (nodeID : string, translation : TranslationState, variables : VariablesState,
        addNodeCreatedVariable: (variable: string, output: string, nodeID: string) => any, syncronous?: boolean) => {
            
    const script = translation.translationCode[nodeID];
    const inputs = translation.inputVars[nodeID];

    const values : any[] = [];
    const names : string[] = [];

    inputs?.forEach(key => {
        values.push(variables.allVariables[key].output);
        names.push(variables.allVariables[key].variable);
    });

    return evaluateScript(nodeID, addNodeCreatedVariable, script, names, values, syncronous);
}

export const evaluateScript = (nodeID : string,
        addNodeCreatedVariable: (variable: string, output: string, nodeID: string) => any,
        script : string, variableNames : string[], variableValues : any[], syncronous?: boolean) => {
    
    try {
        //let newValue = eval(this.state.translationScript)
        const scriptFun = new Function(variableNames.join(), script);
        let newValue = scriptFun.apply(null, variableValues);

        if(typeof newValue == "object") {
            Object.keys(newValue).forEach(async key => {
                 await addNodeCreatedVariable(key, newValue[key].toString(), nodeID);
            });
        } else {
            alert("Need to return object of key-value pairs!");
        }
        return {err: false};
    }
    catch (err) {
        alert("There was an error with the translation script provided. Please check the console for more information");
        console.log(err);
        return {err: true};
    }
}