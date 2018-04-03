// @flow
import React from 'react';

import { Banner, Page, Card, List, DisplayText, Button, TextField, Layout, DescriptionList, ButtonGroup } from '@shopify/polaris';
import axios from 'axios';
import type { RouterHistory } from 'react-router-redux';

type OwnProps = {
  history: RouterHistory
};
// These values are used in development. They are defined in the .env file
const { REACT_APP_SHOPIFY_API_KEY, REACT_APP_SHOP_ORIGIN } = process.env;

class Adminorderlist extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
      title: '',
      content: '',
      requestId: '',
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  state = { showing: true };

  handleGoToProducts = () => {
    const { history } = this.props;
    history.push('/');
  };

  _onPressButton = (value) => {
    const { history } = this.props;
    history.push({
      pathname: '/article',
      state: { detail: value }
    })
  }

  _showReviewArticle = (value) => {
    const { history } = this.props;
    history.push({
      pathname: '/adminreview',
      state: { detail: value }
    })
  }

  _exploreProduct = (value) => {
    window.top.location.href = value;
  }

  handleArticleCont = (content) => {
    this.setState({ content });
  }

  handleArticleTitle = (title) => {
    this.setState({ title });
  }

  handleSubmit(event) {
    event.preventDefault();
    var dataarr = [];
    let temp_bundled = {};
    temp_bundled.articleid = this.state.articleid;
    temp_bundled.title = this.state.title;
    temp_bundled.content = this.state.content;
    dataarr.push(temp_bundled);
    let dataarrd = JSON.stringify({ data: dataarr });
     var apiBaseUrl = "/api/generatearticle";
    var self = this;
    const myInit = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: dataarrd
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

  componentDidMount() {

    console.log('')
    var self = this;

    var url = new URL("https://323f3aa0.ngrok.io/api/getarticles"),
        params = {updateque:'all'}
       

    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))

    const apiUrl = "/api/getarticles";

    const myInit = {
      method: 'GET',
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
        this.setState({ dataitems: responseData.data });
      })
      .catch(function (e) {
        //console.log(e);
      });

  }

  render() {
    const { showing } = this.state;
    const dataitem = this.state.dataitems;
    let renderItems = '';
    if (dataitem) {
      renderItems = this.state.dataitems.map((item, index) => {

        const articlestatus = item.articlestatus;
        console.log(item);

        let productdataJson = item.productdata;
        let protitle = '';
        let prourl = '';
        if(JSON.parse(productdataJson)){
          JSON.parse(productdataJson).map(function (innerItem, innerIndex) {
            protitle = innerItem.title;
            prourl = innerItem.producturl;
          });  
        }
        let productURL = item.shopurl+'/products/'+prourl;
        
        return <Layout.Section key={index}>


              <Card title={protitle}>

                <Card.Section title="">
                
                <span onClick={() => this._exploreProduct(productURL)} style={{"cursor":"pointer", "float":"right", "position": "relative", "top": "-45", "color": "#007ace" }} >Explore Product</span>

                <DescriptionList
                  items={[
                    {
                      term: 'Describe',
                      description: item.describe,
                    },
                  ]}
                />

                <div>
                  <Button onClick={() => this._showReviewArticle(item.id)}>Go to Review</Button>
                  <span style={{"marginLeft":10, "marginTop":35, "display":"inline-block"}}></span>


                  { item.revisionstatus == 'true' ?

                      <Button primary onClick={() => this._onPressButton(item.id)}>Revision Requested</Button>
                       
                    : 

                      articlestatus != 'true' ?
                         <Button primary onClick={() => this._onPressButton(item.id)}>Write a Article</Button>
                       : 
                         null
                  }

                  <span style={{"marginRight":10}}></span>
                  <span style={{"float":"right", "paddingTop": 20}}>{item.createdat}</span>

                </div>
                 

                
                
                
            </Card.Section>
        </Card>
          
        </Layout.Section>
      });
    }

    return (
      <Page title="Orders" secondaryActions={[{ content: 'Back to products', onAction: this.handleGoToProducts },]} >
      
        
        <Layout sectioned>
            
            <Layout.Section secondary>
            {showing ?
                <Layout.Section secondary>
                  <Layout.Section secondary><TextField label="Blog Title" value={this.state.title} onChange={this.handleArticleTitle} /></Layout.Section>
                  <Layout.Section secondary><TextField label="Please describe" name="describe" value={this.state.content} onChange={this.handleArticleCont} multiline /></Layout.Section>
                  <Layout.Section secondary><Button onClick={(event) => this.handleSubmit(event)} size="large" primary submit > Request Article </Button></Layout.Section>
                </Layout.Section>
              : null
            }
            </Layout.Section>

            

            {dataitem ? (
              renderItems
            ) : (
              <Card title="">
                <Card.Section title="">
                  <span>You don't created any request yet!</span>    
                </Card.Section>
              </Card>
            )}
        

        </Layout>

      </Page>
    );
  }
}

export default Adminorderlist;
