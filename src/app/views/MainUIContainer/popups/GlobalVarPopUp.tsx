import React, { Component } from 'react';
import { Button, TextField, Typography } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

type GlobalVarPopUpProps = {
    onCloseClick: () => void,
    addClicked: boolean,
    addEstrangedVariable: (variable: string,
        output: string) => any;
}

class GlobalVarPopUp extends Component<GlobalVarPopUpProps, any> {
    constructor (props:any) {
        super(props);

        this.state = {
			idTextValue: '',
            valTextValue: ''
        }
    }

    onIDInputChange = (event: any) => {
		//(event.target.value);

		this.setState({
			idTextValue: event.target.value,
		});
	};

    onValInputChange = (event: any) => {
		//console.log(event.target.value);

		this.setState({
			valTextValue: event.target.value,
		});
	};

	onAddClick = () => {
		//console.log('Hey we clicked the add button!');
		//console.log(this.state.idTextValue);
        
        this.props.addEstrangedVariable(this.state.idTextValue, this.state.valTextValue);
        this.props.onCloseClick();
	};

    render () {
        // console.log(`Import render ${this.state.showImport}`);
        // console.log(`Import render other ${this.state.importButtonClicked}`);

        return (
            <Dialog
            open={this.props.addClicked}
            onClose={this.props.onCloseClick}
            aria-labelledby='form-dialog-title'>
            <DialogTitle id='form-dialog-title'>Add a Global Variable</DialogTitle>
            <DialogContent>
                {/* <DialogContentText>
                    Liam Liam Liam Liam
                </DialogContentText> */}
                <TextField
                    autoFocus
                    margin='dense'
                    label='Enter ID'
                    type='text'
                    onChange={this.onIDInputChange}
                    fullWidth
                />
                <TextField
                    autoFocus
                    margin='dense'
                    label='Enter Value'
                    type='text'
                    onChange={this.onValInputChange}
                    fullWidth
                />
                {/* <DialogContentText>
                    Alternatively, import from a file
                </DialogContentText>
                <Button onClick={this.onImportFileClick} color='primary'>
                    File
                </Button> */}
            </DialogContent>
            <DialogActions>
                <Button onClick={this.props.onCloseClick} color='primary'>
                    Cancel
                </Button>
                <Button onClick={this.onAddClick} color='primary'>
                    Add
                </Button>
            </DialogActions>
        </Dialog>
        );
    }
}

export default GlobalVarPopUp; 