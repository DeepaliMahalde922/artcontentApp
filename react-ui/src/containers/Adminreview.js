
// @flow
import React from 'react';
import type { RouterHistory } from 'react-router-redux';
import { Banner, Page, DisplayText, Card, Layout, Button, ButtonGroup, AccountConnection, TextField} from '@shopify/polaris';
import axios from 'axios';
type OwnProps = {
  history: RouterHistory
};

// These values are used in development. They are defined in the .env file
const { REACT_APP_SHOPIFY_API_KEY, REACT_APP_SHOP_ORIGIN } = process.env;

type environment = {
  SHOPIFY_API_KEY?: string,
  SHOP_ORIGIN?: string
};

const env: environment = window.env || {};

// Express injects these values in the client script when serving index.html
const { SHOPIFY_API_KEY, SHOP_ORIGIN } = env;

const apiKey: ?string = REACT_APP_SHOPIFY_API_KEY || SHOPIFY_API_KEY;
const shop: ?string = REACT_APP_SHOP_ORIGIN || SHOP_ORIGIN;

const shopOrigin: ?string = shop && `https://${shop}`;


class Adminreview extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      describe: '',
      requestId: '',
      dataitems: '',
      revision: '',
      oneTimeCharge: '',
    }
  }

  componentDidMount() {
    var requestid =  this.props.location.state.detail;
    if(requestid){

      /*Show Initial request*/
      this.setState({ requestId: requestid });

      var self = this;
      const apiUrl = "/api/article/:"+requestid;
      const myInit = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      const myRequest = new Request(apiUrl, myInit);

      fetch(myRequest)
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {
        this.setState({ dataitems: responseData.data });
      })
      .catch(function (e) {
        //console.log(e);
      });

      /*Fetch Request Article to show data*/
      const blogapiUrl = "https://323f3aa0.ngrok.io/api/getsinglearticles/:"+requestid;
      const blogInit = {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };
      const blogRequest = new Request(blogapiUrl, blogInit);

      fetch(blogRequest)
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {
        this.setState({ describe: responseData.data });
      })
      .catch(function (e) {
        //console.log(e);
      });
      
    }
  }


  handleGoToProducts = () => {
    const { history } = this.props;
    history.push('/');
  };

  handleGoTolist = () => {
    const { history } = this.props;
    
    if(REACT_APP_SHOP_ORIGIN == 'test-account-13.myshopify.com'){
      history.push('/adminorderlist');
    }else{
      history.push('/orderlist');  
    }

  };




  render() {

    const dataitem = this.state.dataitems;
    const productId = this.state.productID;
    const describe = this.state.describe;

    
    

    return (
      <Page
        title="Review Request"
        secondaryActions={[
          { 
            content: 'Back to products',
            onAction: this.handleGoToProducts
          },
          {
            content: 'Go to List',
            onAction: this.handleGoTolist
          }
        ]}
      >

        <Layout sectioned>
          <Layout.Section>
            <Card title="Review Request">

              {dataitem ?

                <div>
                {describe ?
                  <Card.Section title="">
                  <DisplayText size="small">Requested revision is not done yet.</DisplayText>
                  <DisplayText size="small">Here is the previous article.</DisplayText>

                  </Card.Section>  
                : null
                }
                <Card.Section title={dataitem.title}>
                  <p>{dataitem.content}</p>
                </Card.Section>
                </div>
              : <Card.Section title="The Article is not done yet.">
                  <p></p>
                </Card.Section>
              }
              

              {describe ?
                <Card.Section title="Requested Revision">
                  <p>{describe}</p>
                </Card.Section>
              : null
              }

            </Card>
          </Layout.Section>
          
         
        </Layout>
      </Page>
    );
  }
}

export default Adminreview;