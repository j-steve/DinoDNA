import 'babel-polyfill';	// required to support all ES6 features
import React from 'react';
import { render } from 'react-dom';
import Dino from './common/components/Dino';


/**
 * Render the app into the document
 */
render(<Dino />, document.getElementById('main'));
