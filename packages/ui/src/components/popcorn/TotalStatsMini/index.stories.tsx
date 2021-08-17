import { CloudIcon, TrendingUpIcon } from '@heroicons/react/outline';
import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { EmissionSummaryStats, TotalStatsMini } from './index';

export default {
  title: 'Popcorn/TotalStats/Mini',
  component: TotalStatsMini,
  decorators: [
    (Story) => (
      <div className="flex flex-row justify-center">
        <Story></Story>
      </div>
    ),
  ],
} as Meta;

const emissionSummaryStats: EmissionSummaryStats[] = [
  {
    id: 1,
    name: 'co2Emissions',
    stat: '71kg',
    icon: CloudIcon,
    change: '12.38%',
    changeType: 'increase',
  },
  {
    id: 2,
    name: 'Transactions',
    stat: '23',
    icon: TrendingUpIcon,
    change: '5.4%',
    changeType: 'increase',
  },
];

const emissionSummaryStatDecrease: EmissionSummaryStats[] = [
  {
    id: 1,
    name: 'co2Emissions',
    stat: '71kg',
    icon: CloudIcon,
    change: '12.38%',
    changeType: 'decrease',
  },
  {
    id: 2,
    name: 'Transactions',
    stat: '23',
    icon: TrendingUpIcon,
    change: '5.4%',
    changeType: 'decrease',
  },
];

const Template: Story = (args) => <TotalStatsMini {...args} />;

export const Increase = Template.bind({});
Increase.args = { emissionSummaryStats: emissionSummaryStats };

export const Decrease = Template.bind({});
Decrease.args = { emissionSummaryStats: emissionSummaryStatDecrease };