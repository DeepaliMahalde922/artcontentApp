
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


class BlogService extends React.Component {


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

  state = { showing: true };

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
    history.push('/orderlist');
  };

  state = {
    connected: false,
    revisionarticle: '',
  }

  _onPressButton = () => {
    const { showing } = this.state;
    this.setState({ showing: !showing });
  }

  /*Send request API to handle oneTime charge*/
  _onPressPayemnt = () => {

      let articleid = this.state.requestId;
      var url = new URL("https://323f3aa0.ngrok.io/api/appcharges"),
          params = {updateque:REACT_APP_SHOP_ORIGIN, articleId:articleid }

      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

      const myInit = {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      fetch(url, myInit)
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {

        if(responseData.message == 'active' || responseData.message == 'accepted'){
            this.setState({ oneTimeCharge: 'true' });
            //console.log('Post publish');
        }else{
          this.setState({ oneTimeCharge: 'false' });
          window.top.location.href = responseData.returnURL;
        }

      })
      .catch(function (e) {
        //console.log(e);
      });

  }


  /* Call Update API for Request Revision */
  handleAction = () => {

    let revsionDes = this.state.describe;
    let requestid = this.state.requestId;

    const { showing } = this.state;
    this.setState({ showing: !showing });

    
   
     
    let dataRev = JSON.stringify({ data: revsionDes });
    var apiBaseUrl = "/api/updatearticles/:"+requestid;
    var self = this;

    const myInit = {
      method: 'PUT',
      //mode: 'no-cors',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: dataRev
    };
    const myRequest = new Request(apiBaseUrl, myInit);
    fetch(myRequest).then(function (response) {
      return response;
    }).then(function (response) {

      if (response.status == 200) {
        alert('Your Entries has been saved.');
      }
      else if (response.status == 500) {
        alert('Something went worng');
      }
      else if (response.status == 404) {
        alert('Please fill all the fields including Product selection.');
      }
    }).catch(function (e) {
      //console.log(e);
    });

  }

  handleDesChange = (describe) => {
    this.setState({ describe });
  }


  render() {

    const dataitem = this.state.dataitems;
    const {revisionarticle, connected} = this.state;
    const buttonText = connected ? 'Disconnect' : 'Submit Revision';
    const productId = this.state.productID;
    const { showing } = this.state;
    const describe = this.state.describe;

    const terms = connected
      ? null
      : (
        <TextField placeholder="Please describe" name="describe" value={this.state.describe} onChange={this.handleDesChange} />
      ); 

    

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
            <Card title="Please Review Your Request">
            
              

              {dataitem ?

                <div>
                {describe ?
                  <Card.Section title="">
                  <DisplayText size="small">You have requested revision which is not done yet. The article will be rewritten asap.</DisplayText>
                  <DisplayText size="small">Here is your previous article.</DisplayText>

                  </Card.Section>  
                : null
                }
                <Card.Section title={dataitem.title}>
                  <p>{dataitem.content}</p>
                </Card.Section>
                </div>
              : <Card.Section title="Your Article is not done yet.">
                  <p>View a summary of your online store’s performance.</p>
                </Card.Section>
              }
              
              <Card.Section title="Acceptance and Payment">
                <p>View a summary of your online store’s performance, including sales, visitors, top products, and referrals.</p>
              </Card.Section>

              {describe ?
                <Card.Section title="Requested Revision">
                  <p>{describe}</p>
                </Card.Section>
              : null
              }

            </Card>
          </Layout.Section>
          <Layout.Section>
            <ButtonGroup>
              {dataitem ?
                <Button onClick={() => this._onPressPayemnt()} primary>Accept Article and Remit Payment</Button>
              : 
                <Button onClick={() => this._onPressPayemnt()} primary disabled>Accept Article and Remit Payment</Button>
              }
              <Button onClick={() => this._onPressButton()}>Request Revision</Button>
            </ButtonGroup>
          </Layout.Section>
          <Layout.Section>

          {showing ?
            <AccountConnection
            revisionarticle={revisionarticle}
            termsOfService=''
            connected={connected}
            title={terms}
            action={{
              content: buttonText,
              onAction: this.handleAction,
            }}
          />
          : null
          }
           
          </Layout.Section>

        </Layout>
      </Page>
    );
  }
}

export default BlogService;