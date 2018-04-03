
// @flow
import React from 'react';
import type { RouterHistory } from 'react-router-redux';
import { Banner, Page, DisplayText, Card, Layout, Button, ButtonGroup } from '@shopify/polaris';

const Review = ({ history }: { history: RouterHistory }) =>
  <Page
    title="Review"
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

export default Review;