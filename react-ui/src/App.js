// @flow
import React from 'react';
import { Route } from 'react-router-dom';

import About from './containers/About';
import ProductsPage from './containers/ProductsPage';
import Review from './containers/Review';
import Orderlist from './containers/Orderlist';
import Adminorderlist from './containers/Adminorderlist';
import Article from './containers/Article';
import Adminreview from './containers/Adminreview';

const App = () =>
  <div>
    <Route exact path="/" component={ProductsPage} />
    <Route exact path="/about" component={About} />
    <Route exact path="/review" component={Review} />
    <Route exact path="/orderlist" component={Orderlist} />
    <Route exact path="/adminorderlist" component={Adminorderlist} />
    <Route exact path="/adminreview" component={Adminreview} />
    <Route exact path="/article" component={Article} />
  </div>;

export default App;
