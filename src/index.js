import "./styles.css";
import { Chart } from "frappe-charts";

const jsonQuery = {
  query: [
    {
      code: "Vuosi",
      selection: {
        filter: "item",
        values: [
          "2000",
          "2001",
          "2002",
          "2003",
          "2004",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021"
        ]
      }
    },
    {
      code: "Alue",
      selection: {
        filter: "item",
        values: ["SSS"]
      }
    },
    {
      code: "Tiedot",
      selection: {
        filter: "item",
        values: ["vaesto"]
      }
    }
  ],
  response: {
    format: "json-stat2"
  }
};

let municipalities = {};
const getMunicipalities = async () => {
  const URL =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";
  const response = await fetch(URL);
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  const municipalities_name = data.variables[1].valueTexts;
  const municipalities_code = data.variables[1].values;

  municipalities = { names: municipalities_name, codes: municipalities_code };
  return;
};

const getData = async () => {
  const URL =
    "https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px";

  const inputField = document.getElementById("input-area");
  const inputtedText = inputField.value;

  if (municipalities["names"].indexOf(inputtedText) !== -1) {
    jsonQuery.query[1].selection.values = [
      municipalities["codes"][municipalities["names"].indexOf(inputtedText)]
    ];
  }

  const response = await fetch(URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(jsonQuery)
  });

  if (!response.ok) {
    return;
  }
  const data = await response.json();

  return data;
};

const initializeChart = async () => {
  const data = await getData();
  const years = Object.values(data.dimension.Vuosi.category.label);
  const births = data.value;

  const chartData = {
    labels: years,
    datasets: [
      {
        name: "births",
        type: "bar",
        values: births
      }
    ]
  };

  const chart = new Chart("#chart", {
    title: "Finnish parliament",
    data: chartData,
    type: "line",
    height: 450,
    colors: ["#eb5146"]
  });

  const addDataBtn = document.getElementById("add-data");
  addDataBtn.addEventListener("click", () => {
    let calc = 0;
    for (let i = 0; i < births.length - 1; i++) {
      calc += births[i + 1] - births[i];
    }
    let result = calc / births.length - 1 + births[births.length - 1];

    chart.addDataPoint("Prediction", [Math.round(result)]);
  });
};

getMunicipalities();

const searchBtn = document.getElementById("submit-data");
searchBtn.addEventListener("click", () => {
  initializeChart();
});
