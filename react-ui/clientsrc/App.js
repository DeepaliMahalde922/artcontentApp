// @flow
import React from 'react';
import { Route } from 'react-router-dom';

import About from './containers/About';
import ProductsPage from './containers/ProductsPage';
import Review from './containers/Review';
import Orderlist from './containers/Orderlist';
import Orders from './containers/Orders';

const App = () =>
  <div>
    <Route exact path="/" component={ProductsPage} />
    <Route exact path="/about" component={About} />
    <Route exact path="/review" component={Review} />
    <Route exact path="/orderlist" component={Orderlist} />
    <Route exact path="/orders" component={Orders} />
  </div>;

export default App;
