// 100 Fictional High-Net-Worth Billionaire Bank Clients Generator
// FUSION 2026 Hackathon - RIFT Bank Private Client Database

import { Client, ClientProfile, Account } from '../types';

const NOW = '2026-10-09T22:00:00.000Z';

const FIRST_NAMES = [
  'Alexander', 'Isabella', 'Cassian', 'Zara', 'Adrian', 'Helena', 'Marcus', 'Elena',
  'Kaelen', 'Siddharth', 'Amara', 'Dante', 'Seraphina', 'Viktor', 'Aurelia', 'Dorian',
  'Valerie', 'Julian', 'Genevieve', 'Lucian', 'Celeste', 'Dominic', 'Evangeline', 'Gideon',
  'Nicolette', 'Sebastian', 'Freya', 'Thaddeus', 'Rosalind', 'Xavier', 'Octavia', 'Raphael',
  'Saskia', 'Tristan', 'Vespera', 'Maximilian', 'Corinne', 'Leander', 'Astrid', 'Callum',
  'Ophelia', 'Gabriel', 'Lyra', 'Harrison', 'Clara', 'Roderick', 'Rowena', 'Vincent',
  'Evelyn', 'Balthazar'
];

const LAST_NAMES = [
  'Veyron', 'Laurent', 'Wolfe', 'Ellington', 'Blackwell', 'Ashford', 'Vance', 'Rostova',
  'Sterling', 'Oberoi', 'Cross', 'Novak', 'Mercer', 'Kovacs', 'Vanderbilt', 'Sinclair',
  'Rutherford', 'Hawthorne', 'Montgomery', 'Kensington', 'Davenport', 'Perrin', 'St. Claire', 'Beaumont',
  'Carlisle', 'Kingsley', 'Thorne', 'DuPont', 'Chen', 'Siddiqui', 'Takahashi', 'Al-Mansoor',
  'Romanov', 'Lindqvist', 'Fontaine', 'Castellano', 'Nakamoto', 'Moreau', 'Solomon', 'Grafton',
  'Holloway', 'Wainwright', 'Fitzgerald', 'Delacroix', 'Bancroft', 'Grosvenor', 'Rothschild', 'Rockefeller',
  'Soros', 'Dalio'
];

const CATEGORIES = [
  'Technology Founder',
  'Global Investment Principal',
  'Digital Asset Fund Manager',
  'Private Equity Investor',
  'Family Office Principal',
  'Corporate Treasury Executive',
  'Sovereign Wealth Advisor',
  'Quantum Computing Pioneer',
  'Interchain Infrastructure Fund',
  'Aerospace & Defense Magnate'
];

const HEADLINES = [
  'Founder & Principal Shareholder, Quantum Systems',
  'Managing Principal, Sovereign Equity & Infrastructure',
  'Chief Investment Officer, Interchain Arbitrage Fund',
  'Senior Partner, Global Buyout Fund VII',
  'Dynasty Multi-Generational Family Office',
  'Executive Vice President & Group Treasurer',
  'Managing Director, Frontier Tech Capital',
  'Chief Executive Officer, Deep Space Orbital Labs',
  'Founding General Partner, Interchain Capital Group',
  'Chairman, Global Energy Transition Trust'
];

function generate100Clients(): Client[] {
  const clients: Client[] = [];
  
  // Seed 1-6 explicitly match original Alexander Veyron & core team
  const explicitSeeds = [
    {
      id: 'cli_alexander_veyron',
      name: 'Alexander Veyron',
      category: 'Technology Founder',
      headline: 'Founder & Principal Shareholder, Veyron Aerospace & Quantum Systems',
      simulated_net_worth_display: '$86.4 billion',
      simulated_net_worth_units: 8640000000000,
      status: 'ACTIVE',
      created_at: NOW,
      accounts: [
        {
          id: 'acc_veyron_treasury_usd',
          client_id: 'cli_alexander_veyron',
          account_number: 'RF-8821-USD',
          account_name: 'Veyron Holdings Master Treasury',
          account_type: 'TREASURY',
          asset: 'TEST_USD',
          balance_base_units: 485000000000,
          reserved_base_units: 0,
          available_balance_base_units: 485000000000,
          is_active: true,
          chain_id: 31337,
          onchain_address: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
          created_at: NOW
        },
        {
          id: 'acc_veyron_liquidity_usd',
          client_id: 'cli_alexander_veyron',
          account_number: 'RF-8822-USD',
          account_name: 'Prime Liquid Operational Reserve',
          account_type: 'LIQUIDITY',
          asset: 'TEST_USD',
          balance_base_units: 75000000000,
          reserved_base_units: 0,
          available_balance_base_units: 75000000000,
          is_active: true,
          created_at: NOW
        }
      ]
    },
    {
      id: 'cli_isabella_laurent',
      name: 'Isabella Laurent',
      category: 'Global Investment Principal',
      headline: 'Managing Principal, Laurent Sovereign Equity & Infrastructure',
      simulated_net_worth_display: '$52.8 billion',
      simulated_net_worth_units: 5280000000000,
      status: 'ACTIVE',
      created_at: NOW,
      accounts: [
        {
          id: 'acc_laurent_treasury_usd',
          client_id: 'cli_isabella_laurent',
          account_number: 'RF-7101-USD',
          account_name: 'Laurent Sovereign Global Treasury',
          account_type: 'TREASURY',
          asset: 'TEST_USD',
          balance_base_units: 290000000000,
          reserved_base_units: 0,
          available_balance_base_units: 290000000000,
          is_active: true,
          chain_id: 31337,
          onchain_address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
          created_at: NOW
        }
      ]
    },
    {
      id: 'cli_cassian_wolfe',
      name: 'Cassian Wolfe',
      category: 'Digital Asset Fund Manager',
      headline: 'Chief Investment Officer, Hyperion Interchain Arbitrage Fund',
      simulated_net_worth_display: '$34.2 billion',
      simulated_net_worth_units: 3420000000000,
      status: 'ACTIVE',
      created_at: NOW,
      accounts: [
        {
          id: 'acc_wolfe_liquidity_usd',
          client_id: 'cli_cassian_wolfe',
          account_number: 'RF-6201-USD',
          account_name: 'Hyperion High-Frequency Bridge Liquidity',
          account_type: 'LIQUIDITY',
          asset: 'TEST_USD',
          balance_base_units: 185000000000,
          reserved_base_units: 0,
          available_balance_base_units: 185000000000,
          is_active: true,
          chain_id: 31337,
          onchain_address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
          created_at: NOW
        }
      ]
    },
    {
      id: 'cli_zara_ellington',
      name: 'Zara Ellington',
      category: 'Private Equity Investor',
      headline: 'Senior Partner, Ellington Capital Global Buyout Fund VII',
      simulated_net_worth_display: '$19.6 billion',
      simulated_net_worth_units: 1960000000000,
      status: 'ACTIVE',
      created_at: NOW,
      accounts: [
        {
          id: 'acc_ellington_treasury_usd',
          client_id: 'cli_zara_ellington',
          account_number: 'RF-5301-USD',
          account_name: 'Ellington Buyout Special Purpose Treasury',
          account_type: 'TREASURY',
          asset: 'TEST_USD',
          balance_base_units: 94000000000,
          reserved_base_units: 0,
          available_balance_base_units: 94000000000,
          is_active: true,
          chain_id: 31337,
          onchain_address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
          created_at: NOW
        }
      ]
    },
    {
      id: 'cli_adrian_blackwell',
      name: 'Adrian Blackwell',
      category: 'Family Office Principal',
      headline: 'Blackwell Dynasty Multi-Generational Trust & Family Office',
      simulated_net_worth_display: '$12.7 billion',
      simulated_net_worth_units: 1270000000000,
      status: 'ACTIVE',
      created_at: NOW,
      accounts: [
        {
          id: 'acc_blackwell_liquidity_usd',
          client_id: 'cli_adrian_blackwell',
          account_number: 'RF-4401-USD',
          account_name: 'Blackwell Dynasty Liquid Family Reserve',
          account_type: 'LIQUIDITY',
          asset: 'TEST_USD',
          balance_base_units: 62000000000,
          reserved_base_units: 0,
          available_balance_base_units: 62000000000,
          is_active: true,
          chain_id: 31338,
          onchain_address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
          created_at: NOW
        }
      ]
    },
    {
      id: 'cli_helena_ashford',
      name: 'Helena Ashford',
      category: 'Corporate Treasury Executive',
      headline: 'Executive Vice President & Group Treasurer, Ashford Global Logistics',
      simulated_net_worth_display: '$8.9 billion',
      simulated_net_worth_units: 890000000000,
      status: 'ACTIVE',
      created_at: NOW,
      accounts: [
        {
          id: 'acc_ashford_treasury_usd',
          client_id: 'cli_helena_ashford',
          account_number: 'RF-3101-USD',
          account_name: 'Ashford Logistics Interchain Supply Treasury',
          account_type: 'TREASURY',
          asset: 'TEST_USD',
          balance_base_units: 48000000000,
          reserved_base_units: 0,
          available_balance_base_units: 48000000000,
          is_active: true,
          chain_id: 31337,
          onchain_address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
          created_at: NOW
        }
      ]
    }
  ];

  clients.push(...(explicitSeeds as any));

  // Generate clients 7 to 100 programmatically
  for (let i = 7; i <= 100; i++) {
    const fn = FIRST_NAMES[(i * 7) % FIRST_NAMES.length];
    const ln = LAST_NAMES[(i * 11) % LAST_NAMES.length];
    const name = `${fn} ${ln}`;
    const category = CATEGORIES[i % CATEGORIES.length];
    const headline = `${HEADLINES[i % HEADLINES.length]} (${ln} Group)`;
    
    // Billionaire net worth between $1.2B and $45.5B
    const netWorthBillions = Number((1.2 + ((i * 13) % 44)).toFixed(1));
    const netWorthUnits = Math.round(netWorthBillions * 100000000000);
    const clientId = `cli_demo_user_${i.toString().padStart(3, '0')}`;
    const accNumber = `RF-${(1000 + i * 17).toString()}-USD`;
    const accBalanceUsd = (netWorthBillions * 0.15).toFixed(2);
    const baseUnits = Math.round(Number(accBalanceUsd) * 100);

    const account: Account = {
      id: `acc_demo_${i}_usd`,
      client_id: clientId,
      account_number: accNumber,
      account_name: `${ln} Private Vault Treasury`,
      account_type: i % 2 === 0 ? 'TREASURY' : 'LIQUIDITY',
      asset: 'TEST_USD',
      balance_base_units: baseUnits,
      reserved_base_units: 0,
      available_balance_base_units: baseUnits,
      is_active: true,
      chain_id: i % 3 === 0 ? 31338 : 31337,
      onchain_address: `0x${(1000000000000000000000000000000000000000 + i).toString(16).padStart(40, '0')}`,
      created_at: NOW
    };

    clients.push({
      id: clientId,
      name,
      category,
      headline,
      simulated_net_worth_display: `$${netWorthBillions} billion`,
      simulated_net_worth_units: netWorthUnits,
      status: 'ACTIVE',
      created_at: NOW,
      accounts: [account]
    });
  }

  return clients;
}

export const MOCK_100_CLIENTS: Client[] = generate100Clients();

export function getMockClientProfile(clientId: string): ClientProfile {
  const cl = MOCK_100_CLIENTS.find((c) => c.id === clientId) || MOCK_100_CLIENTS[0];
  const accs = cl.accounts || [];

  const totalCalculatedUsd = accs.reduce((acc, a) => acc + a.available_balance_base_units / 100, 0);

  return {
    ...cl,
    headline: cl.headline || 'Institutional Private Banking Client',
    total_calculated_usd: totalCalculatedUsd || 1000000000,
    total_available_usd: totalCalculatedUsd || 1000000000,
    total_reserved_usd: 0,
    accounts: accs,
    asset_allocation: [
      { asset: 'TEST_USD', percentage: 75, value_usd: (totalCalculatedUsd || 1000000000) * 0.75 },
      { asset: 'TEST_ETH', percentage: 15, value_usd: (totalCalculatedUsd || 1000000000) * 0.15 },
      { asset: 'TEST_EUR', percentage: 10, value_usd: (totalCalculatedUsd || 1000000000) * 0.10 }
    ]
  };
}
