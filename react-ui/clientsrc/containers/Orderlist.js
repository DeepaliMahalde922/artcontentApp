// @flow
import React from 'react';

import { Banner, Page, DisplayText, Button, TextStyle, Layout, Card, ResourceList } from '@shopify/polaris';
import axios from 'axios';
import type { RouterHistory } from 'react-router-redux';

type OwnProps = {
  history: RouterHistory
};


class Orderlist extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dataitems: '',
    }
  }



  handleGoToProducts = () => {
    const { history } = this.props;
    history.push('/');
  };

  componentDidMount() {
   

  }

  render() {
   
    return (
         <Card>
          <ResourceList
          items={[
            {
              url: '#',
              attributeOne: 'How to Get Value from Wireframes',
              attributeTwo: 'by Jonathan Mangrove',
              attributeThree: <TextStyle variation="subdued">Today, 7:14pm</TextStyle>,
            },
            {
              url: '#',
              attributeOne: 'Test blog post',
              attributeTwo: 'by Jonathan Mangrove',
              attributeThree: <TextStyle variation="subdued">Jan 14, 2016, 8:24am</TextStyle>,
              badges: [
                {content: 'Hidden'},
              ],
            },
          ]}
          renderItem={this.renderItem}
        />
      </Card>
    );
  }

  renderItem = (item, index) => {
    return (
      <ResourceList.Item key={index} {...item} />
    );
  }

}

export default Orderlist;
