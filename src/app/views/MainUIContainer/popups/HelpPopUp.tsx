import React, { Component } from 'react';
import { Button, TextField, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { ipcRenderer, remote } from 'electron';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Debug from '@/Debug';

type HelpPopUpProps = {
    onCloseClick: () => void,
    helpClicked: boolean
}

class HelpPopUp extends Component<HelpPopUpProps, any> {
    constructor(props: any) {
        super(props);

        this.state = {

        }
    }

    render () {
        return (
            <Dialog
                open={this.props.helpClicked}
                onClose={this.props.onCloseClick}
                aria-labelledby='form-dialog-title'>

                <DialogTitle id='form-dialog-title'>HELP</DialogTitle>
                <DialogContent>

                    <DialogContentText>
                        Importing APIs: Upon pressing the import button, you can enter a file, a valid URL, or raw text in JSON format 
                    </DialogContentText>
                    <DialogContentText>
                        Adding Requests: Once a collection is imported, simply clicking a request inside the collection will add one to the graph. 
                    </DialogContentText>
                    <DialogContentText>
                        Editing Requests: Clicking on the node inside the graph will bring up a form to change request fields.
                    </DialogContentText>
                    <DialogContentText>
                        Translation Nodes: Like with requests, clicking on a translation node will bring up a form. Inside the form, a user can select a variable, modify it through code, then choose a new variable name.
                    </DialogContentText>
                    <DialogContentText>
                        Chaining Requests: Pressing shift and left clicking on a node will bring up a draggable arrow which will bring up a variable select form once the ends are specified.
                    </DialogContentText>
                    <a target="_blank" href="http://vale.cs.umd.edu/apibreadboard_manual.pdf">For more in-depth help, click here.</a>
                </DialogContent>

            </Dialog>
        )
    }
}

export default HelpPopUp;