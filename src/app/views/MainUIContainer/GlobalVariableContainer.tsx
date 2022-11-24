import { List, ListItem, ListItemSecondaryAction, TextField, IconButton, Menu, MenuItem, Button } from "@material-ui/core";
import React, { ChangeEvent, Component } from "react";
import { VariablesState } from '../../store/variables/types';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Debug from "@/Debug";
import { ipcRenderer } from "electron";

interface GlobalVariableContainerProps {
	variables: VariablesState;
    deleteVariable: (id:string) => any;
	renameVariable: (variable:string, newVariable:string, id:string) => any;
    onAddButtonClick: () => void;
}

interface GlobalVariableContainerState {
	rename : boolean;
    anchorEl: HTMLElement | null;
    activeElement: number;
    nameBuf: string;
}

class GlobalVariableContainer extends Component<GlobalVariableContainerProps, GlobalVariableContainerState> {
    constructor(props: any) {
        super(props);

        this.state = {
            rename: false,
            anchorEl: null,
            activeElement: -1,
            nameBuf: ""
        }
    }

    onMenuClicked(event: React.MouseEvent<HTMLButtonElement>, idx: number) {
        this.setState({anchorEl: event.currentTarget, activeElement: idx});
    }

    onRenameChange(event: ChangeEvent<HTMLInputElement>) {
        //console.log("PRRRINNTTINGGGG", event.target.value);
        this.setState({nameBuf: event.target.value});
        //console.log("PRINTINTNTINTNTNITINT",this.state);
    }

    render() {  
        //global variables container now only displays estranged variables
        const variablesEntries = Object.entries(this.props.variables.estrangedVariables);
        variablesEntries.sort((a,b) => a[1].variable.localeCompare(b[1].variable));
        return (
            // Im not a big CSS guy so I stole the styling of collections container
            <>
            <div className='CollectionsContainer'>
            <Button
                onClick={this.props.onAddButtonClick}
                variant='outlined'
                color='primary'>
                Add
            </Button>
            </div>
            <List>
                {variablesEntries.map(([id, variableObj], idx) => {
                    if(this.state.rename && idx == this.state.activeElement) {
                        return (
                            <ListItem key={id}>
                                <TextField
                                    label={"Rename"}
                                    defaultValue={variableObj.variable}
                                    onChange={this.onRenameChange.bind(this)}
                                    onKeyPress={(event) => {
                                        Debug.log('misc', event.key);
                                        if(event.key == 'Enter') {
                                            this.setState({rename: false, activeElement: -1});
                                            //console.log(this.state.nameBuf);
                                            this.props.renameVariable(variableObj.variable, this.state.nameBuf, id);
                                        }
                                    }}
                                />
                            </ListItem>
                        );
                    } else {
                        return (
                            <ListItem key={id}>
                                {variableObj.variable + ": " + variableObj.output}
                                <ListItemSecondaryAction>
                                    <IconButton edge="end" aria-label="rename" onClick={(event) => this.onMenuClicked(event, idx)}>
                                        <MoreVertIcon />
                                    </IconButton>
                                    <Menu 
                                        anchorEl={this.state.anchorEl} 
                                        open={this.state.activeElement == idx}
                                        onClose={() => this.setState({anchorEl: null, activeElement: -1})}
                                        keepMounted
                                    >
                                        <MenuItem onClick={() => this.setState({rename: true})}>Rename</MenuItem>
                                        <MenuItem onClick={() => {
                                            this.props.deleteVariable(id);
                                            this.setState({activeElement: -1});
                                            ipcRenderer.send('delete-variable', id);
                                        }}>Delete</MenuItem>
                                    </Menu>
                                </ListItemSecondaryAction>
                            </ListItem>
                        );
                    }
                })}
                
            </List>
            </>
           
        );
    }
}

export default GlobalVariableContainer;