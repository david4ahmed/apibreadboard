import React, { Component } from 'react';

export const NODE_KEY = 'id'; // Key used to identify nodes

// These keys are arbitrary (but must match the config)
// However, GraphView renders text differently for empty types
// so this has to be passed in if that behavior is desired.
export const NODE = 'defaultNode';
export const EDGE = 'defaultEdge';
export const TRANSLATION_NODE = 'translationNode'; 

export const nodeTypes = [NODE];
export const edgeTypes = [EDGE];

const NodeShape = (
	<symbol viewBox='0 0 154 54' width='154' height='74' id='defaultNode'>
		<rect x='0' y='0' rx='2' ry='2' width='154' height='54' />
	</symbol>
);

const TranslationNodeShape = (
	<symbol viewBox='0 0 120 120' width='120' height='120' id='translationNode'>
		{/* <rect x='0' y='0' rx='2' ry='2' width='154' height='54' /> */}
		<circle cx="60" cy="60" r="55"></circle>
	</symbol>
);

const EdgeShape = (
	<symbol viewBox='0 0 50 50' id='defaultEdge'>
		<circle cx='25' cy='25' r='8' fill='currentColor' />
	</symbol>
);

export default {
	EdgeTypes: {
		defaultEdge: {
			shape: EdgeShape,
			shapeId: '#defaultEdge',
		},
	},
	NodeTypes: {
		defaultNode: {
			shape: NodeShape,
			shapeId: '#defaultNode',
			typeText: 'API Node',
		},
		translationNode: {
			shape: TranslationNodeShape,
			shapeId: '#translationNode',
			typeText: 'Translation Node',
		},
	},
};
