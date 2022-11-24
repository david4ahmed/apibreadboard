import React, { Component } from 'react';
import { Button, ButtonGroup, TextField, Typography } from '@material-ui/core';
import APIList from './APIList';

type CollectionsContainerProps = {
    onImportButtonClick: () => void,
    onHelpButtonClick: () => void,
    collections: any[],
	selectRequest: (request: any) => any
    deleteCollection: (CID: number) => any;
}

class CollectionsContainer extends Component<CollectionsContainerProps, any> {
    constructor (props:any) {
        super(props);

        this.state = {
        }
    }

    render () {

        return (
            <div className='CollectionsContainer'>
            <ButtonGroup color = "primary" aria-label="outlined primary button group">
            <Button
                onClick={this.props.onHelpButtonClick}
                variant='outlined'
                color='primary'>
                Help
            </Button>
            <Button
                onClick={this.props.onImportButtonClick}
                variant='outlined'
                color='primary'>
                Import
            </Button>
            </ButtonGroup>
            <div>
                <APIList
                    collectionData={this.props.collections}
                    selectRequest={this.props.selectRequest}
                    deleteCollection={this.props.deleteCollection}
                />
            </div>
        </div>
        );
    }
}

export default CollectionsContainer;