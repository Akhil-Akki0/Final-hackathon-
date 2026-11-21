export const ASSETS = {
  flyInVideo:
    'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261106_025717_906b686d-9a9a-4dea-bab4-ae2454f8390e.mp4',
  heroStill:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_031618_8ce6dca1-972d-429d-8d13-bf0691c37848.png&w=2400&q=88',
  heroCutout:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_031657_baaa3380-5ece-482a-a623-a1838fd7653c.png&w=2400&q=90',
  rockSpriteSheet:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_025635_82593f6a-1cf7-41c1-94ac-96fb89ebfd1a.png&w=2400&q=85',
  sensorMastStill:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_025630_9a37a1e0-2547-4973-8160-c75205993914.png&w=1400&q=82',
  floatingIslandCloudsStill:
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261106_025545_b003e5cc-e68f-4fee-b686-c217a5d81eea.png&w=1400&q=82',
} as const;

export interface NavItem {
  id: string;
  label: string;
  targetProgress?: number;
  targetSelector?: string;
  summary: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'solutions',
    label: 'Solutions',
    targetSelector: '#solutions',
    summary: 'Ecological accounting, biodiversity indexing, and audit-grade MRV packages.',
  },
  {
    id: 'tech',
    label: 'Our tech',
    targetProgress: 0.84,
    summary: 'Solar-autonomous sensor masts with louvered microclimate arrays.',
  },
  {
    id: 'company',
    label: 'Company',
    targetProgress: 0.25,
    summary: 'Built to translate complex field ecology into commercial-grade intelligence.',
  },
  {
    id: 'resources',
    label: 'Resources',
    targetProgress: 0.52,
    summary: 'Calibration methodologies, open plot telemetry, and compliance briefs.',
  },
];

export interface HotspotData {
  id: string;
  left: string;
  top: string;
  label: string;
  value: string;
}

export const HOTSPOTS: HotspotData[] = [
  { id: 'soil-carbon', left: '12%', top: '58%', label: 'Soil carbon', value: '+3.8 t/ha' },
  { id: 'canopy-moisture', left: '33%', top: '41%', label: 'Canopy moisture', value: '71 % RH' },
  { id: 'species-index', left: '70%', top: '66%', label: 'Species index', value: '214 taxa' },
  { id: 'microclimate', left: '83%', top: '47%', label: 'Microclimate', value: '14.2 °C' },
];

export interface FeatureRowData {
  index: string;
  label: string;
  detail: string;
}

export const STATION_FEATURES: FeatureRowData[] = [
  {
    index: '01',
    label: 'Gold-standard observation system',
    detail: 'Continuous multi-strata sensing calibrated against peer-reviewed eddy-covariance baselines.',
  },
  {
    index: '02',
    label: 'World-class atmospheric monitoring (AMRV)',
    detail: 'Automated measurement, reporting, and verification across CO₂ flux, humidity, and barometric drift.',
  },
  {
    index: '03',
    label: 'Integrated algorithmic processing',
    detail: 'Edge-filtered anomaly rejection paired with seasonal biomass and soil respiration models.',
  },
  {
    index: '04',
    label: 'Blockchain-secured traceability',
    detail: 'Immutable cryptographic hashes anchor each raw telemetry epoch for third-party climate audits.',
  },
  {
    index: '05',
    label: 'Built for scale and complexity',
    detail: 'Low-power mesh nodes deployable from alpine peatlands to dense tropical canopies.',
  },
];

export interface SolutionCardData {
  id: string;
  code: string;
  title: string;
  description: string;
  metric: string;
  image: string;
  alt: string;
  specs: string[];
}

export const SOLUTION_CARDS: SolutionCardData[] = [
  {
    id: 'carbon-accounting',
    code: '01 · Carbon & Soil',
    title: 'Ecological Carbon Accounting',
    description:
      'Replace annual desktop estimates with continuous ground-truth flux measurements across root zones and mossy horizons.',
    metric: '±0.14 tCO₂e/ha precision',
    image: ASSETS.sensorMastStill,
    alt: 'Autonomous grey field sensor mast standing in mossy fern terrain',
    specs: ['Sub-surface soil respiration probes', 'Solar-autonomous 15-minute intervals', 'CSRD & GHG Protocol ready'],
  },
  {
    id: 'biodiversity-canopy',
    code: '02 · Acoustic & eDNA',
    title: 'Living Biome Intelligence',
    description:
      'Track avian, insect, and bryophyte biodiversity shifts continuously using passive bioacoustics and microclimate arrays.',
    metric: '214+ taxa indexed per plot',
    image: ASSETS.floatingIslandCloudsStill,
    alt: 'Elevated mossy rock ecosystem floating above misty clouds',
    specs: ['Passive ultrasonic & audible capture', 'Canopy vapour pressure deficit (VPD)', 'TNFD LEAP disclosure exports'],
  },
  {
    id: 'audit-mrv',
    code: '03 · Audit Ledger',
    title: 'Verifiable Climate MRV',
    description:
      'Every field observation is cryptographically timestamped at the mast and packaged for registry and board-level assurance.',
    metric: '100% signed telemetry chain',
    image: ASSETS.sensorMastStill,
    alt: 'Field observation mast surrounded by misty green moss',
    specs: ['Hardware-signed raw sensor payloads', 'Automated calibration drift logs', 'Direct auditor read-only portal'],
  },
];

export interface SolutionStatData {
  id: string;
  target: number;
  decimals: number;
  suffix: string;
  label: string;
  sublabel: string;
}

export const SOLUTION_STATS: SolutionStatData[] = [
  {
    id: 'stations',
    target: 142,
    decimals: 0,
    suffix: '',
    label: 'Field stations active',
    sublabel: 'Across 19 biomes',
  },
  {
    id: 'uptime',
    target: 99.4,
    decimals: 1,
    suffix: '%',
    label: 'Telemetry uptime',
    sublabel: 'Solar + mesh redundancy',
  },
  {
    id: 'hectares',
    target: 24.8,
    decimals: 1,
    suffix: 'k',
    label: 'Hectares measured',
    sublabel: 'Continuous ground-truth',
  },
  {
    id: 'cadence',
    target: 15,
    decimals: 0,
    suffix: ' min',
    label: 'Verification cadence',
    sublabel: 'Signed ledger intervals',
  },
];
