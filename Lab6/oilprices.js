window.addEventListener('load', getFuelPrice)

oilprices = {}

function getEnglishFuelNames(fuelName) {
  switch (fuelName) {
    case 'แก๊สโซฮอล์ 95': return 'Gasohol 95';
    case 'แก๊สโซฮอล์ 91': return 'Gasohol 91';
    
    case 'แก๊สโซฮอล์ E20': return 'Gasohol E20';
    case 'แก๊สโซฮอล์ E85': return 'Gasohol E85';

    case 'เบนซิน 95': return 'Benzine 95';
    case 'เบนซิน 91': return 'Benzine 91';

    case 'ดีเซล': return 'Diesel';

    default: return null;
  }
} 


async function getFuelPrice() {
  try {
    const response = await fetch('https://gasprice.kapook.com/gasprice.php');
    const text = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');

    const allData = {};
    if (doc) { // Check if the element exists before iterating
      for (const section of doc.querySelectorAll('.gasprice')) {
        const brand = section.querySelector('h3').textContent.slice(11).match(/\([^)]+\)/)[0].slice(1, -1)
        const brandData = {};

        for (const row of section.querySelectorAll('li')) {
          const type = getEnglishFuelNames(row.querySelector('span').textContent.trim());
          if (!type) continue; // Skip if the type is not found
          const price = row.querySelector('em').textContent.trim();
          brandData[type] = price;
        }

        allData[brand] = brandData;
      }
    }
    oilprices = allData
    return allData;
  } catch (error) {
    console.error('Error fetching fuel price:', error);
    return {}; // Return an empty object in case of error
  }
}


// async function getBangchakPrices() {
//   const url = 'https://corsproxy.io/?' + encodeURIComponent('Https://oil-price.bangchak.co.th/ApiOilPrice2/en/');
//   let response = await fetch(url)
//   let data = await response.json()
//   console.log(data[0])
//   let actualData = JSON.parse(data[0].OilList)
//   return {
//     'E20': actualData.find(oil => oil.OilName === 'Gasohol E20 S EVO').PriceToday,
//     'Gasoline95': actualData.find(oil => oil.OilName === 'Gasohol 95 S EVO').PriceToday,
//     'Gasoline91': actualData.find(oil => oil.OilName === 'Gasohol 91 S EVO').PriceToday,
//     'Diesel': actualData.find(oil => oil.OilName === 'Hi Diesel S').PriceToday
//     //Gasohol E85 S EVO
//   }
// }


// async function getPTTPrices() {
//   const url = 'https://test.cors.workers.dev?' + encodeURIComponent('https://orapiweb2.pttor.com/api/oilprice/search');
//   const body = "{\"provinceId\":1,\"districtId\":null,\"year\":2024,\"month\":7,\"pageSize\":1000000,\"pageIndex\":0}"
//   let response = await fetch(url, {"method": "POST", "body": body})
//   let data = await response.json()
//   let actualData = JSON.parse(data['data'][0]['priceData'])
//   console.log(actualData)
//   return {
//     'Diesel': actualData.find(oil => oil.OilTypeId === 17).Price,
//     'Gasoline95': actualData.find(oil => oil.OilTypeId === 9).Price,
//     'Gasoline91': actualData.find(oil => oil.OilTypeId === 10).Price,
//     'E20': actualData.find(oil => oil.OilTypeId === 11).Price
//   }

// }