/**
 * Predefined country groups for community creation
 * Organized by geographic, political, and cultural regions
 */

export const COUNTRY_GROUPS = {
  // European Union (27 countries)
  EU: {
    name: 'European Union',
    countries: ['AUT', 'BEL', 'BGR', 'HRV', 'CYP', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'LVA', 'LTU', 'LUX', 'MLT', 'NLD', 'POL', 'PRT', 'ROU', 'SVK', 'SVN', 'ESP', 'SWE']
  },
  
  // Nordic Countries
  NORDIC: {
    name: 'Nordic Countries',
    countries: ['DNK', 'FIN', 'ISL', 'NOR', 'SWE']
  },
  
  // North America
  NORTH_AMERICA: {
    name: 'North America',
    countries: ['USA', 'CAN', 'MEX']
  },
  
  // Latin America
  LATIN_AMERICA: {
    name: 'Latin America',
    countries: ['ARG', 'BOL', 'BRA', 'CHL', 'COL', 'CRI', 'CUB', 'DOM', 'ECU', 'SLV', 'GTM', 'HND', 'MEX', 'NIC', 'PAN', 'PRY', 'PER', 'URY', 'VEN']
  },
  
  // Asia Pacific
  ASIA_PACIFIC: {
    name: 'Asia Pacific',
    countries: ['AUS', 'BGD', 'CHN', 'HKG', 'IND', 'IDN', 'JPN', 'KOR', 'MYS', 'NZL', 'PAK', 'PHL', 'SGP', 'LKA', 'TWN', 'THA', 'VNM']
  },
  
  // Middle East
  MIDDLE_EAST: {
    name: 'Middle East',
    countries: ['BHR', 'EGY', 'IRN', 'IRQ', 'ISR', 'JOR', 'KWT', 'LBN', 'OMN', 'PSE', 'QAT', 'SAU', 'SYR', 'TUR', 'ARE', 'YEM']
  },
  
  // Africa
  AFRICA: {
    name: 'Africa',
    countries: ['DZA', 'AGO', 'BEN', 'BWA', 'BFA', 'BDI', 'CMR', 'CPV', 'CAF', 'TCD', 'COM', 'COG', 'COD', 'CIV', 'DJI', 'EGY', 'GNQ', 'ERI', 'ETH', 'GAB', 'GMB', 'GHA', 'GIN', 'GNB', 'KEN', 'LSO', 'LBR', 'LBY', 'MDG', 'MWI', 'MLI', 'MRT', 'MUS', 'MAR', 'MOZ', 'NAM', 'NER', 'NGA', 'RWA', 'STP', 'SEN', 'SYC', 'SLE', 'SOM', 'ZAF', 'SSD', 'SDN', 'SWZ', 'TZA', 'TGO', 'TUN', 'UGA', 'ZMB', 'ZWE']
  },
  
  // G7 Countries
  G7: {
    name: 'G7 Countries',
    countries: ['CAN', 'FRA', 'DEU', 'ITA', 'JPN', 'GBR', 'USA']
  },
  
  // G20 Major Economies (subset - countries only)
  G20: {
    name: 'G20 Countries',
    countries: ['ARG', 'AUS', 'BRA', 'CAN', 'CHN', 'FRA', 'DEU', 'IND', 'IDN', 'ITA', 'JPN', 'MEX', 'RUS', 'SAU', 'ZAF', 'KOR', 'TUR', 'GBR', 'USA']
  },
  
  // ASEAN
  ASEAN: {
    name: 'ASEAN',
    countries: ['BRN', 'KHM', 'IDN', 'LAO', 'MYS', 'MMR', 'PHL', 'SGP', 'THA', 'VNM']
  },
  
  // Caribbean
  CARIBBEAN: {
    name: 'Caribbean',
    countries: ['ATG', 'BHS', 'BRB', 'BLZ', 'CUB', 'DMA', 'DOM', 'GRD', 'HTI', 'JAM', 'KNA', 'LCA', 'VCT', 'TTO']
  },
  
  // South Asia
  SOUTH_ASIA: {
    name: 'South Asia',
    countries: ['AFG', 'BGD', 'BTN', 'IND', 'MDV', 'NPL', 'PAK', 'LKA']
  },
  
  // Central Asia
  CENTRAL_ASIA: {
    name: 'Central Asia',
    countries: ['KAZ', 'KGZ', 'TJK', 'TKM', 'UZB']
  },
  
  // Balkans
  BALKANS: {
    name: 'Balkans',
    countries: ['ALB', 'BIH', 'BGR', 'HRV', 'GRC', 'XK', 'MKD', 'MNE', 'ROU', 'SRB', 'SVN']
  },
  
  // English-Speaking (major)
  ENGLISH_SPEAKING: {
    name: 'English-Speaking Countries',
    countries: ['AUS', 'CAN', 'IRL', 'NZL', 'GBR', 'USA', 'ZAF', 'IND', 'PHL', 'SGP', 'JAM']
  },
  
  // Spanish-Speaking
  SPANISH_SPEAKING: {
    name: 'Spanish-Speaking Countries',
    countries: ['ARG', 'BOL', 'CHL', 'COL', 'CRI', 'CUB', 'DOM', 'ECU', 'SLV', 'GNQ', 'GTM', 'HND', 'MEX', 'NIC', 'PAN', 'PRY', 'PER', 'ESP', 'URY', 'VEN']
  },
  
  // French-Speaking
  FRENCH_SPEAKING: {
    name: 'French-Speaking Countries',
    countries: ['BEL', 'BEN', 'BFA', 'BDI', 'CMR', 'CAF', 'TCD', 'COM', 'COG', 'COD', 'CIV', 'DJI', 'FRA', 'GAB', 'GIN', 'LUX', 'MLI', 'MCO', 'NER', 'RWA', 'SEN', 'SYC', 'CHE', 'TGO']
  },
};

export type CountryGroupKey = keyof typeof COUNTRY_GROUPS;

