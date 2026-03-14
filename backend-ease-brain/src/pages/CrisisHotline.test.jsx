/* eslint-env jest */
import React from 'react';
import { render } from '@testing-library/react';
import CrisisHotline from './CrisisHotline';

test('renders primary call and text actions with correct hrefs', () => {
  const { container } = render(<CrisisHotline />);

  // hero call link to 988
  const heroCall = container.querySelector('a[href^="tel:988"]');
  expect(heroCall).not.toBeNull();

  // resource chat sms link
  const smsLink = container.querySelector('a[href^="sms:741741"]');
  expect(smsLink).not.toBeNull();

  // international hotline call link should exist for USA (tel links)
  const intlCall = container.querySelector('a[href^="tel:"]');
  expect(intlCall).not.toBeNull();
});
