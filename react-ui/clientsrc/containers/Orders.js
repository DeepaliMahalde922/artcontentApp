
// @flow
import React from 'react';
import type { RouterHistory } from 'react-router-redux';
import { Banner, Page, DisplayText, Card, Layout, Button, ButtonGroup, ResourceList, TextStyle } from '@shopify/polaris';

const Reviews = ({ history }: { history: RouterHistory }) =>
  <Page
    title="Orders"
    secondaryActions={[
      { content: 'Back to products', onAction: () => history.goBack() }
    ]}
  >
<DisplayText size="extraLarge">Your Request is Ready!</DisplayText> 
<Layout sectioned>
<Layout.Section>
<Card title="Please Review Your Request">
  <Card.Section title="Your Article">
    <p>View a summary of your online store’s performance.</p>
  </Card.Section>

  <Card.Section title="Acceptance and Payment">
    <p>View a summary of your online store’s performance, including sales, visitors, top products, and referrals.</p>
  </Card.Section>
</Card>
</Layout.Section>
<Layout.Section>
<ButtonGroup>
    <Button primary>Accept Article and Remit Payment</Button>
    <Button>Request Revision</Button>
    </ButtonGroup>
    </Layout.Section>
</Layout>
  </Page>;

class Orders extends React.Component {
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
    )
  }

  renderItem = (item, index) => {
    return (
      <ResourceList.Item key={index} {...item} />
    );
  }
}

export default Orders;