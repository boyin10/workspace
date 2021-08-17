import {
  CloudIcon,
  CursorClickIcon,
  TrendingUpIcon,
} from '@heroicons/react/outline';
import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';
import { AddContractButton } from '../../../AddContractButton';
import Container from '../../../Container/';
import { ContractStatsMini } from '../../../ContractStatsMini';
import { Divider } from '../../../Divider';
import { PageHeader } from '../../../PageHeader';
import { TotalStatsMini } from '../../../TotalStatsMini';

const totalStatsEmissionsData = [
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
  {
    id: 3,
    name: 'Average Gas Price',
    stat: '45',
    icon: CursorClickIcon,
    change: '3.2%',
    changeType: 'decrease',
  },
];

const contractStats = [
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

const EmissionsDashboardPage = () => {
  return (
    <div className="bg-gray-50">
      <PageHeader />
      <TotalStatsMini emissionSummaryStats={totalStatsEmissionsData} />
      <Divider />
      <ContractStatsMini
        emissionSummaryStats={contractStats}
        contractName={'Popcorn HYSI Staking Pool'}
      />
      <ContractStatsMini
        emissionSummaryStats={contractStats}
        contractName={'Popcorn HYSI Staking Pool'}
      />
      <ContractStatsMini
        emissionSummaryStats={contractStats}
        contractName={'Popcorn HYSI Staking Pool'}
      />
      <ContractStatsMini
        emissionSummaryStats={contractStats}
        contractName={'Popcorn HYSI Staking Pool'}
      />
      <AddContractButton />
    </div>
  );
};

export default {
  title: 'Emissions Dashboard / Dashboard / Mini',
  component: EmissionsDashboardPage,
  decorators: [
    (Story) => (
      <div>
        <Container title={'Smart Contract Emissions Dashboard'} />
        {/* Main 3 column grid */}
        <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
          {/* Left column */}
          <div className="grid grid-cols-1 gap-4 lg:col-span-2">
            <section aria-labelledby="section-1-title">
              <h2 className="sr-only" id="section-1-title">
                Section title
              </h2>
              <div className="rounded-lg bg-white overflow-hidden shadow">
                <div className="p-6">{/* Your content */}</div>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="grid grid-cols-1 gap-4">
            <section aria-labelledby="section-2-title">
              <h2 className="sr-only" id="section-2-title">
                Section title
              </h2>
              <div className="rounded-lg bg-white overflow-hidden shadow">
                <div className="p-6">{/* Your content */}</div>
              </div>
            </section>
          </div>
        </div>
        <Story />
      </div>
    ),
  ],
} as Meta;

const Template: Story = (args) => <EmissionsDashboardPage {...args} />;

export const Primary = Template.bind({});
Primary.args = {};
