// @flow
import _ from 'lodash';
import React, { Component } from 'react';
import type { Element } from 'react';
import type { RouterHistory } from 'react-router-redux';
import { connect } from 'react-redux';

import { Page, Card, ResourceList, Thumbnail, Select, Layout, FormLayout, TextField, ChoiceList, Heading, Button, DisplayText } from '@shopify/polaris';
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

export class ProductsPageComponent extends Component<Props, OwnState> {
  state = {
    resourcePickerOpen: false
  };

  componentDidMount() {
    const { fetchProducts } = this.props;

    fetchProducts();
  }

  handleGoToProducts = () => {
    const { history } = this.props;

    history.push('/Review');
  };

  handleGoToOrderlist = () => {
    const { history } = this.props;

    history.push('/Orderlist');
  };

  handleGoToOrders = () => {
    const { history } = this.props;

    history.push('/Orders');
  };

  handleResourceSelected = (resources: Resources) => {
    const { addProduct } = this.props;
    const { products } = resources;

    addProduct(products[0]);

    this.setState({ resourcePickerOpen: false });
  };

  render() {
    const { products = [] } = this.props;
    const { resourcePickerOpen } = this.state;

    return (
      <Page
        title="Products"
        primaryAction={{
          content: 'Add product 122',
          onAction: () => this.setState({ resourcePickerOpen: true })
        }}
        secondaryActions={[
          {
            content: 'About',
            onAction: this.handleGoToProducts
          },
          {
            content: 'Orders',
            onAction: this.handleGoToOrders
          },
          {
            content: 'Orders List',
            onAction: this.handleGoToOrderlist
          }
        ]}
        
      >
<DisplayText size="extraLarge">ContentMark</DisplayText>        <ResourcePicker
          products
          open={resourcePickerOpen}
          onSelection={this.handleResourceSelected}
          onCancel={() => this.setState({ resourcePickerOpen: false })}
          allowMultiple={true}
        />
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
        <Card sectioned
        title="Type of Content"
        >
            <ChoiceList
            
            choices={[
              {
                label: 'How To Article',
                value: 'howto',
                
              }
              ,
              {
                label: 'Best Of Article',
                value: 'experience',
              },
              {
                label: 'Required',
                value: 'required',
              },
            ]}
            selected={['required']}
          />
          
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
          <Card
            title="Please describe what kind of article you would like written"
            sectioned
          >
            <TextField
  
  multiline
/>
          </Card>
        </Layout.Section>
        <Layout.Section secondary>
        <DisplayText size="small">The cost of the article is $50. You will have a chance to review and approve the article before submitting payment.</DisplayText>
</Layout.Section>
        <Layout.Section secondary>
        <Button
  size="large"
  primary
  submit
>
  Request Article
</Button>
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