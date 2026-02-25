import { findDOMNode } from 'find-dom-node-polyfill';
import ReactDOM from 'react-dom';

// Patch ReactDOM.findDOMNode back for React 19 compatibility.
// Needed by archived packages like draft-js that use this removed API.
if (typeof (ReactDOM as any).findDOMNode === 'undefined') {
  (ReactDOM as any).findDOMNode = findDOMNode;
}
