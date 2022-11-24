import React, { Component, MouseEvent } from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';

import { IconButton, ListItemSecondaryAction, Menu, MenuItem } from '@material-ui/core';
import { ipcRenderer } from 'electron';
import Debug from '@/Debug';


interface ApiListProps {
	collectionData: Array<any>;
	selectRequest: (request: any) => any;
	deleteCollection:(CID: number) => any;
}

interface ApiListState {
	showCollections: any; 
	anchorEl: HTMLElement | null;
    activeElement: number;
}

/*
    Assuming I wrote this correctly, this should map parts of the collectionData into separate sections inside a 
    Material-UI List component. Now you may ask why this is a large block/paragraph comment rather than having small
    comments inside detailing my every move. I do not know how to properly do comments, at least inside of JSX. I didn't
    feel like experimenting so alas here is my diary entry. Honestly, I probably won't understand what this function does
    later on. I give myself like a day or two before I forget.
    */

class APIList extends Component<ApiListProps, ApiListState> {
	constructor(props: any) {
		super(props);
		this.state = {
			showCollections: {},
			anchorEl: null,
            activeElement: -1,
		}
	}

	onCollectionClick = (key: string) => {
		var showCollections = this.state.showCollections;
		showCollections[key] = !showCollections[key];
		this.setState({showCollections: showCollections});
	} 

	onDeleteClick(CID: number){
		Debug.log('YM', "API DELETECOLLECTION", CID)
		this.props.deleteCollection(CID);
		ipcRenderer.send('delete-collection', CID);
		//ipcRenderer.on('delete-collection-response', (event: any, arg: any) => {
			
			//Debug.log('misc', "DELETE WORKKKKKSSS", arg);

			
		//});
	}

	generateTagList(tags : any, CID : number, baseURL : string, key : string) {
		return (
			<Collapse in={this.state.showCollections[key]}>
				<List>
					{Object.keys(tags).map((tagKey : string, idx : number) => {
						if(tagKey == "requests") {
							return tags[tagKey]?.map((request: any, idx: number) => {
								const { method, requestName, description, RID } = request;
								return (
									<Tooltip key={key + "." + RID} title={description? description.content : ''} placement="top" disableHoverListener={!description}>
										<ListItem
											button
											onClick={() => this.props.selectRequest({...request, CID: CID, baseURL: baseURL, added: false})}>
											<ListItemText primary={`${method} - ${requestName}`} />
										</ListItem>	
									</Tooltip>
								);
							});
						} else {
							const pathKey = key + "." + tagKey;
							return (
								<React.Fragment key={pathKey}>
								<ListItem
									onClick={() => this.onCollectionClick(pathKey)}>
									<ListItemText primary={tagKey} />
									{this.state.showCollections[pathKey] ? <ExpandLess/> : <ExpandMore />}
								</ListItem>
								{this.generateTagList(tags[tagKey], CID, baseURL, pathKey)}
								</React.Fragment>
							);
						}
					})}
				</List>
			</Collapse>
		);
	}

	render() {
		return (
			<>
			<List
				component='nav'
				aria-labelledby='apiist-subheader'>
				{this.props.collectionData?.map((collectionData, idx) => {
					const { collectionName, tags, CID, baseURL } = collectionData;
					return (
						<React.Fragment key={CID}>
						<ListItem
							onClick={() => this.onCollectionClick(CID)}>
							<ListItemText primary={collectionName} />
							{this.state.showCollections[CID] ? <ExpandLess/> : <ExpandMore />}
							
							<ListItemSecondaryAction>
								{/* this is for the delete icon */}
								<IconButton edge="end" aria-label="delete"  onClick={() => this.onDeleteClick(CID)}>
									<DeleteIcon/>
								</IconButton>
							</ListItemSecondaryAction>
							
						</ListItem>
						{this.generateTagList(tags, CID, baseURL, CID)}
						</React.Fragment>
					);
				})}
			</List>
			</>
		);
	}
}

export default APIList;
