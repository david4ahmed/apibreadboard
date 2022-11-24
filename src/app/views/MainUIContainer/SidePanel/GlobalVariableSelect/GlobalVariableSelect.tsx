import './GlobalVariableSelect.scss'
import React, { Component } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@material-ui/core';

type GlobalVariableSelectProps = {
    variables: { id: string; variable: string; output: string; }[];
    id: string; 
    name: string; 
    inputLabel: string; 
    onChange: (event: any) => void; 
    select? : string | string[];
    multiple? : boolean;
}

type GlobalVariableSelectState = {
    selected : any;
}

class GlobalVariableSelect extends Component <GlobalVariableSelectProps, GlobalVariableSelectState> {
    constructor(props: any) {
        super(props);
        this.state = {
            selected: this.props.multiple? [] : "",
        }
    }

    reloadState() {
        this.setState({selected: this.props.select});
    }

    componentDidUpdate(prevProps: GlobalVariableSelectProps) {
        if(prevProps.select !== this.props.select) {
            this.reloadState();
        }
    }

    
    componentDidMount() {
        if(this.props.select) {
            this.reloadState();
        }
    }

    render () {
        return (
            <FormControl fullWidth id={this.props.id}>
                    <InputLabel id="demo-simple-select-label">{this.props.inputLabel}</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        name={this.props.name}
                        fullWidth
                        multiple={this.props.multiple}
                        onChange={(event) => {
                            this.props.onChange(event);
                            this.setState({selected: event.target.value});
                        }}
                        value={this.state.selected}
                    >
                        {this.props.variables.map((variable: any) => {
                            return <MenuItem key={variable.id} value={variable.id} id={this.props.id}>
                                {variable.variable}
                                {/* <Typography color="textSecondary">
                                    {variable.id[0] == "-"? " (Global Variable)": ""}
                                </Typography> */}
                            </MenuItem>
                        })}
                    </Select>
            </FormControl>
        )
    }
}

export default GlobalVariableSelect; 