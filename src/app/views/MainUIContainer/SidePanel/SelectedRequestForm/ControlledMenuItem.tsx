import { VariablesMap } from "@/app/store/variables/types";
import { MenuItem } from "@material-ui/core";
import React from "react";
import { Component } from "react";

interface ControlledMenuItemProps{
    variable: VariableValue;
    key: string;
}

interface VariableValue {
    id: string;
    variable: string;
    output: string;
}

class ControlledMenuItem extends Component<ControlledMenuItemProps, any> {

    constructor(props: any){
        super(props);
        this.state = {}
    }

    menuItemOnClick = (e: any, variable: VariableValue) => {
        console.log(e)
    }

    render() {
        const {variable, key} = this.props;
        const length = variable.output?.length;

        return (
            <div onClick={(e) => {this.menuItemOnClick(e, variable)}}>
                <MenuItem value = {variable.output} id={key} >{`${variable.variable} : ${variable.output.slice(0, 8)}${length > 8 ? "..." : ""}`}</MenuItem>
            </div>
        )
    }

}

export default ControlledMenuItem;