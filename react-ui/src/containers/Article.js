
// @flow
import React from 'react';
import { Banner, Page, Card, DisplayText, Layout, Button, TextField } from '@shopify/polaris';
import type { RouterHistory } from 'react-router-redux';

import axios from 'axios';
type OwnProps = {
  history: RouterHistory
};


class Article extends React.Component {


  constructor(props) {
    super(props);
    this.state = {
    	title: '',
    	content: '',
      articleid: '',
      dataitems: '',
    	revision: '',
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    var requestid =  this.props.location.state.detail;
    if(requestid){

      this.setState({ requestId: requestid });

      /*Fetch Request Article to show data*/
      const blogapiUrl = "https://2bb62ebf.ngrok.io/api/getsinglearticles/:"+requestid;
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
        console.log(responseData.data);
        this.setState({ revision: responseData.data });
      })
      .catch(function (e) {
        //console.log(e);
      });


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
          this.setState({ title: responseData.data.title });
          this.setState({ content: responseData.data.content });
          this.setState({ dataitems: responseData.data });
        })
        .catch(function (e) {
         // console.log(e);
        });

    }
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
    temp_bundled.articleid = this.state.requestId;
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
     // console.log(e);
    }); 

  }

  handleGoToProducts = () => {
    const { history } = this.props;
    history.push('/');
  };

  handleGoTolist = () => {
    const { history } = this.props;
    history.push('/orderlist');
  };



  render() {

    let requestid = this.state.requestId;
    let arttitle = "Write article for request number "+requestid;

    let requestRevision = '';
    let revision = this.state.revision;

    if(revision){
  	    requestRevision = "Requested revision is: "+revision;
    }

    return (
      

      <Page
        title="Write Article"
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

            <Card title={arttitle}>
              <Card.Section title={requestRevision}>

					<Layout.Section secondary>
						<TextField label="Blog Title" value={this.state.title} onChange={this.handleArticleTitle} />
					</Layout.Section>
					<Layout.Section secondary>
						<TextField label="Please describe" name="describe" value={this.state.content} onChange={this.handleArticleCont} multiline />
					</Layout.Section>
					<Layout.Section secondary>
						<Button onClick={(event) => this.handleSubmit(event)} size="large" primary submit > Request Article </Button>
					</Layout.Section>

			    </Card.Section>
			</Card>

        </Layout>

        
      </Page>
    );
  }
}

export default Article;