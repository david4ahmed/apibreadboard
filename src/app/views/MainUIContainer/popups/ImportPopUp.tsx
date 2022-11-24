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
import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-json"
import "ace-builds/src-noconflict/ext-language_tools.js";

type ImportPopUpProps = {
    onCloseClick: () => void,
    importClicked: boolean
}

class ImportPopUp extends Component<ImportPopUpProps, any> {
    constructor (props:any) {
        super(props);

        this.state = {
			importTextValue: '',
            showRawInputModal: false
        }
    }

    onTextInputChange = (event: any) => {
		Debug.log('misc', event.target.value);

		this.setState({
			importTextValue: event.target.value,
		});
	};

    onRawInputChange = (event: string) => {
        this.setState({
            importTextValue: event
        });
    }

    importCollectionViaURL = (url: string) => {
		Debug.log('misc', 'import collection url');
		ipcRenderer.send('import-collection-url', url);
	};

    importCollectionViaRaw = (rawInput: string) => {
		Debug.log('misc', 'import collection raw');
		ipcRenderer.send('import-collection-raw', rawInput);
	};    

	onImportUrlClick = () => {
		Debug.log('misc', 'Hey we clicked the import button');
		Debug.log('misc', this.state.importTextValue);

		this.importCollectionViaURL(this.state.importTextValue);

        this.props.onCloseClick();
	};

    onRawJsonClick = () => {
		// this.importCollectionViaURL(this.state.importTextValue);
        this.setState({
			showRawInputModal: true
		});
        // this.props.onCloseClick();
	};

    onRawJsonCloseClick = () => {
		// this.importCollectionViaURL(this.state.importTextValue);
        this.setState({
			showRawInputModal: false
		});
        // this.props.onCloseClick();
	};

    onRawJsonEnterClick = () => {
		this.importCollectionViaRaw(this.state.importTextValue);
        this.onRawJsonCloseClick();
	};

    onImportFileClick = () => {
		Debug.log('misc', 'Hey we clicked the import button');
		
		remote.dialog.showOpenDialog({
			filters: [{
				name: "API Spec",
				extensions: ["json", "yaml"],
			}],
			properties: ['openFile']
		}).then(result => {
			if(!result.canceled) {
				ipcRenderer.send('import-collection-file', result.filePaths[0]);
                this.props.onCloseClick();
			}
		});
	};

    render () {
        // console.log(`Import render ${this.state.showImport}`);
        // console.log(`Import render other ${this.state.importButtonClicked}`);

        return (
            <>
            <Dialog
            open={this.props.importClicked}
            onClose={this.props.onCloseClick}
            aria-labelledby='form-dialog-title'>
            <DialogTitle id='form-dialog-title'>Import</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Import the data of either OpenAPI or Swagger Specifications.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin='dense'
                    label='Enter a URL'
                    type='text'
                    onChange={this.onTextInputChange}
                    fullWidth
                />
                <DialogContentText>
                    Alternatively, import from a file, or perhaps provide the raw JSON
                </DialogContentText>
                <Button onClick={this.onImportFileClick} color='primary'>
                    File
                </Button>
                <Button onClick={this.onRawJsonClick} color='primary'>
                    Raw JSON
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={this.props.onCloseClick} color='primary'>
                    Cancel
                </Button>
                <Button onClick={this.onImportUrlClick} color='primary'>
                    Import
                </Button>
            </DialogActions>
        </Dialog>
        <Dialog
            fullScreen
            open={this.state.showRawInputModal}
            onClose={this.onRawJsonCloseClick}
            aria-labelledby='form-dialog-title'>
        <Toolbar>
            <IconButton edge="start" color="inherit" onClick={this.onRawJsonCloseClick} aria-label="close">
                <CloseIcon />
            </IconButton>
            <Button autoFocus color="inherit" onClick={this.onRawJsonEnterClick}>
              Enter
            </Button>
        </Toolbar>
            <DialogContent>
                <AceEditor
                    mode="json"
                    height="100%"
                    width="100%"
                    placeholder="Write your API JSON here"
                    theme="chrome"
                    onChange={this.onRawInputChange}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{ $blockScrolling: true }}
                    showGutter={false}
                    wrapEnabled={false}
                    highlightActiveLine={true}
                    enableBasicAutocompletion={true}
                    enableLiveAutocompletion={true}
                    setOptions={{
                        spellcheck: true,
                        showLineNumbers: true,
                        enableSnippets: true,
                        fontSize: "10pt"
                    }}
                />
                {/*<TextField
                    autoFocus
                    margin='dense'
                    label='Enter raw JSON'
                    type='text'
                    onChange={this.onTextInputChange}
                    fullWidth
                    multiline
                    rows={40}
                    rowsMax={Infinity}
                />*/}
            </DialogContent>
        </Dialog>
        </>
        );
    }
}

export default ImportPopUp; 
