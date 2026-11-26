/* Data for the Republic of Nusantara, a fictional island nation.
   Every figure here is invented for this demonstration site and is
   internally consistent across years and provinces. Nothing is copied
   from any real statistics office. Currency: NS$ (Nusantara senar). */

var NUSANTARA = {
  country: "Republic of Nusantara",
  office: "Badan Statistik Nusantara",
  officeShort: "BSN",
  years: [2021, 2022, 2023, 2024, 2025],
  latestYear: 2025,
  currency: "NS$",
  areaKm2: 282500,

  byYear: {
    2021: { population: 45.8, gdp: 491.3, growth: 3.9, unemployment: 5.6, inflation: 4.8,
            lifeExpectancy: 73.4, literacy: 95.1, schooling: 11.6, beds: 16.9, doctors: 6.8,
            infantMortality: 13.8, exports: 114.6, imports: 108.9 },
    2022: { population: 46.4, gdp: 519.7, growth: 4.5, unemployment: 5.0, inflation: 4.2,
            lifeExpectancy: 73.7, literacy: 95.5, schooling: 11.8, beds: 17.3, doctors: 7.1,
            infantMortality: 13.1, exports: 122.9, imports: 115.3 },
    2023: { population: 47.0, gdp: 548.2, growth: 4.8, unemployment: 4.6, inflation: 3.6,
            lifeExpectancy: 74.0, literacy: 96.0, schooling: 12.0, beds: 17.8, doctors: 7.4,
            infantMortality: 12.4, exports: 131.5, imports: 121.0 },
    2024: { population: 47.6, gdp: 578.9, growth: 5.1, unemployment: 4.3, inflation: 3.1,
            lifeExpectancy: 74.3, literacy: 96.4, schooling: 12.2, beds: 18.2, doctors: 7.6,
            infantMortality: 11.8, exports: 139.8, imports: 126.4 },
    2025: { population: 48.2, gdp: 612.4, growth: 5.4, unemployment: 4.1, inflation: 2.8,
            lifeExpectancy: 74.6, literacy: 96.8, schooling: 12.4, beds: 18.6, doctors: 7.9,
            infantMortality: 11.2, exports: 148.2, imports: 132.6 }
  },

  /* GDP by sector, percent share of GDP, by year. Each row sums to 100. */
  sectors: {
    2021: [["Services", 50.1], ["Industry", 28.2], ["Agriculture", 14.4], ["Mining", 7.3]],
    2022: [["Services", 50.6], ["Industry", 27.9], ["Agriculture", 14.0], ["Mining", 7.5]],
    2023: [["Services", 51.2], ["Industry", 27.5], ["Agriculture", 13.6], ["Mining", 7.7]],
    2024: [["Services", 51.9], ["Industry", 27.1], ["Agriculture", 13.2], ["Mining", 7.8]],
    2025: [["Services", 52.4], ["Industry", 26.8], ["Agriculture", 12.9], ["Mining", 7.9]]
  },

  /* Age pyramid for 2025: share of the whole population, percent, by sex.
     Columns sum to 100.0; children 0-14 are 24.1%, working age 68.3%, 65+ 7.6%. */
  pyramid: [
    ["0-4",   4.2, 4.0], ["5-9",   4.1, 3.9], ["10-14", 4.0, 3.9],
    ["15-19", 4.1, 4.0], ["20-24", 4.0, 3.9], ["25-29", 3.9, 3.8],
    ["30-34", 3.8, 3.7], ["35-39", 3.7, 3.6], ["40-44", 3.5, 3.5],
    ["45-49", 3.3, 3.3], ["50-54", 3.0, 3.0], ["55-59", 2.7, 2.7],
    ["60-64", 2.4, 2.4], ["65-69", 1.6, 1.7], ["70-74", 1.1, 1.2],
    ["75+",   0.9, 1.1]
  ],

  /* Twelve provinces. Populations are millions in 2025 and sum to 48.2;
     provincial GDP is NS$ billions in 2025 and sums to 612.4. */
  provinces: [
    { name: "Tanjung Raya",   capital: "Kota Tanjung", population: 8.2, gdp: 148.6, area: 12400, coast: "West coast" },
    { name: "Kepulauan Sari", capital: "Pulau Sari",   population: 6.8, gdp: 96.3,  area: 28900, coast: "Islands" },
    { name: "Lembah Hijau",   capital: "Hijau Kota",   population: 5.6, gdp: 71.2,  area: 34200, coast: "Inland valley" },
    { name: "Pantai Timur",   capital: "Timur Jaya",   population: 5.1, gdp: 64.8,  area: 21700, coast: "East coast" },
    { name: "Dataran Tinggi", capital: "Tinggi Baru",  population: 4.2, gdp: 52.4,  area: 41300, coast: "Highlands" },
    { name: "Teluk Biru",     capital: "Biru Laut",    population: 3.8, gdp: 48.1,  area: 18600, coast: "Bay" },
    { name: "Hutan Rimba",    capital: "Rimba",        population: 3.3, gdp: 38.9,  area: 52800, coast: "Forest interior" },
    { name: "Pulau Karang",   capital: "Karang",       population: 2.9, gdp: 31.5,  area: 9800,  coast: "Islands" },
    { name: "Sungai Besar",   capital: "Besar",        population: 2.6, gdp: 24.7,  area: 27400, coast: "River delta" },
    { name: "Bukit Emas",     capital: "Emas",         population: 2.2, gdp: 16.8,  area: 15900, coast: "Hills" },
    { name: "Danau Tenang",   capital: "Tenang",       population: 1.9, gdp: 11.4,  area: 11200, coast: "Lake district" },
    { name: "Ujung Selatan",  capital: "Selatan",      population: 1.6, gdp: 7.7,   area: 8300,  coast: "South coast" }
  ],

  topExports: ["Palm oil products", "Electronics", "Textiles", "Coffee", "Nickel ore"],
  topImports: ["Machinery", "Fuels", "Vehicles", "Wheat", "Medicines"],

  releases: [
    ["12 Nov 2025", "Population estimate 2025", "48.2 million people"],
    ["28 Oct 2025", "GDP, third quarter 2025", "Growth 5.4% year on year"],
    ["15 Oct 2025", "Labour force survey, August 2025", "Unemployment 4.1%"],
    ["02 Oct 2025", "Consumer prices, September 2025", "Inflation 2.8%"],
    ["18 Sep 2025", "Education and health indicators 2025", "Literacy 96.8%"]
  ]
};
