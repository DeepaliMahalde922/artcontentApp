// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import type { Element } from 'react';
import type { RouterHistory } from 'react-router-redux';
import { connect } from 'react-redux';

import { Page, Card, ResourceList, Thumbnail, Layout, TextField, ChoiceList, Button, DisplayText } from '@shopify/polaris';
import { ResourcePicker } from '@shopify/polaris/embedded';

import { addProduct, fetchProducts } from '../redux/products';
import type { AddProductAction, Product, State, ThunkAction } from '../types';


type ProductResource = {
  media?: Element<*>,
  attributeOne: string,
  attributeTwo: string,
  attributeThree: string
};

type OwnProps = {
  history: RouterHistory
};

type StateProps = {
  products: ProductResource[]
};

type DispatchProps = {
  addProduct: (product: Product) => AddProductAction,
  fetchProducts: () => ThunkAction
};

type Props = StateProps & DispatchProps & OwnProps;

type OwnState = {
  resourcePickerOpen: boolean
};

type Resources = {
  products: Product[]
};

// These values are used in development. They are defined in the .env file
const { REACT_APP_SHOPIFY_API_KEY, REACT_APP_SHOP_ORIGIN } = process.env;

type environment = {
  SHOPIFY_API_KEY?: string,
  SHOP_ORIGIN?: string
};

const env: environment = window.env || {};
const { SHOPIFY_API_KEY, SHOP_ORIGIN } = env;
const shop: ?string = REACT_APP_SHOP_ORIGIN || SHOP_ORIGIN;
const shopOrigin: ?string = shop && `https://${shop}`;


export class ProductsPageComponent extends Component<Props, OwnState> {


  constructor(props) {
    super(props);
    this.state = {
      shopUrl: '',
      describe: '',
      contenType: ['required'],
      productData: '',
    }
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    const userfields = this.state;
    var dataarr = [];
    let temp_bundled = {};
    if(shopOrigin){
      temp_bundled.shopUrl = shopOrigin;
    }else{
      temp_bundled.shopUrl = this.state.shopUrl;
    }
    temp_bundled.describe = this.state.describe;
    temp_bundled.contenType = this.state.contenType;
    temp_bundled.productData = this.state.productData;
    temp_bundled.resourcePickerOpen = this.state.resourcePickerOpen;

    if(this.state.productData != '' && shopOrigin != ''){
        dataarr.push(temp_bundled);

        let dataarrd = JSON.stringify({ data: dataarr });
        var apiBaseUrl = "https://323f3aa0.ngrok.io/api/newarticles";

        const myInit = {
          method: 'POST',
          //mode: 'no-cors',
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
          if (response.status === 200) {
            alert('Your Entries has been saved.');
          }
          else if (response.status === 500) {
            alert('Something went worng');
          }
          else if (response.status === 404) {
            alert('Please fill all the fields including Product selection.');
          }
        }).catch(function (e) {
          //console.log(e);
        });
    }else{
      alert('Please select product.');
    }
    

  }

  handleChange = (value) => {
    this.setState({ contenType: value });
  }
  handleDesChange = (describe) => {
    this.setState({ describe });
  }

  state = {
    resourcePickerOpen: false
  };

  componentDidMount() {
    const { fetchProducts } = this.props;
    fetchProducts();
  }

  handleGoToProducts = () => {
    const { history } = this.props;
    history.push('/about');
  };

  handleGoTorder = () => {
    const { history } = this.props;
    
    if(REACT_APP_SHOP_ORIGIN == 'test-account-13.myshopify.com'){
      history.push('/adminorderlist');
    }else{
      history.push('/orderlist');  
    }

  };



  handleResourceSelected = (resources: Resources) => {
    const { addProduct } = this.props;
    const { products } = resources;

    let locationName = window.location.href;
    let answer_array = locationName.split('&');
    var shopUrl = '';
    answer_array.map((item, index) => {
      if (item.indexOf("shop") !== -1) {
        let shopattr = item.split('=');
        shopUrl = 'https://' + shopattr[1];
        this.setState({ shopUrl: shopUrl });
      }
    });


    if (Object.keys(products).length !== 0) {

      let proData = this.state.productData;
      if (proData === '') {
        var productArr = [];
      } else {
        let temparr = [];
        proData.map((item, index) => {
          let temp_bundled = {};
          temp_bundled.title = item.title;
          temp_bundled.producturl = item.producturl;
          temparr.push(temp_bundled);
        });
        var productArr = [];
        productArr = temparr;
      }

      products.map((item, index) => {
        let temp_bundled = {};
        temp_bundled.title = item.title;
        temp_bundled.producturl = item.handle;
        productArr.push(temp_bundled);
        this.setState({ productData: productArr });
      });
    }


    addProduct(products[0]);
    this.setState({ resourcePickerOpen: false });
  };

  render() {

    const { contenType } = this.state;
    const { products = [] } = this.props;
    const { resourcePickerOpen } = this.state;

    return (
      <Page
        title="Products"
        primaryAction={{
          content: 'Add product',
          onAction: () => this.setState({ resourcePickerOpen: true })
        }}

        secondaryActions={[
          {
            content: 'Go to About',
            onAction: this.handleGoToProducts
          },
          {
            content: 'Go to Order',
            onAction: this.handleGoTorder
          },
        ]}

      >

        <DisplayText size="extraLarge">ContentMark</DisplayText>

        <ResourcePicker products open={resourcePickerOpen} onSelection={this.handleResourceSelected} onCancel={() => this.setState({ resourcePickerOpen: false })} allowMultiple={true} />

        <Layout sectioned>

          <Layout.Section>

            

            <Card>
              <ResourceList
                items={products}
                renderItem={(item: ProductResource, index: number) =>
                  <ResourceList.Item key={index} {...item} />}
              />
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card sectioned title="Type of Content" >

              <ChoiceList
                title="Type of Choices"
                choices={[
                  { label: 'How To Article', value: 'howto', },
                  { label: 'Best Of Article', value: 'experience', },
                  { label: 'Required', value: 'required', },
                ]}
                selected={contenType}
                onChange={this.handleChange}
              />
            </Card>
          </Layout.Section>

          <Layout.Section secondary>
            <Card title="Please describe what kind of article you would like written" sectioned >
              <TextField label="Please describe" name="describe" value={this.state.describe} onChange={this.handleDesChange} multiline/>
            </Card>
          </Layout.Section>

          <Layout.Section secondary>
            <DisplayText size="small">The cost of the article is $50. You will have a chance to review and approve the article before submitting payment.</DisplayText>
          </Layout.Section>

          <Layout.Section secondary>
            <Button onClick={(event) => this.handleSubmit(event)} size="large" primary submit > Request Article </Button>
          </Layout.Section>

        </Layout>

      </Page>

    );
  }
}

const getProductResources = (products: ?(Product[])) =>
  _.map(products, (product: Product): ProductResource => {
    const { image = {}, product_type, title, vendor } = product;

    return {
      media: image && <Thumbnail source={image.src} alt={title} />,
      attributeOne: title,
      attributeTwo: product_type,
      attributeThree: vendor
    };
  });

const mapStateToProps = (state: State): StateProps => {
  const { products } = state;

  return {
    products: getProductResources(products)
  };
};

const dispatchProps: DispatchProps = { addProduct, fetchProducts };

export default connect(mapStateToProps, dispatchProps)(ProductsPageComponent);