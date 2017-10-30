var gigify = function(value) {
  return value < 1000 ? '' + value + 'MB' : '' + (value / 1000) + 'GB';
};

var pluralise = function(value, plur, sing) {
  return value > 1 || value === 0 ? plur : sing;
};

var db = new loki('db.json');

var data = [
  {
    data: 12000,
    minutes: 99999,
    texts: 99999,
    price: 14.00,
    url: 'http://example.com',
    length: 24,
    merchant: {
      logo: 'three.svg',
      name: 'Three'
    }
  },
  {
    data: 15000,
    minutes: 99999,
    texts: 99999,
    price: 21.00,
    url: 'http://example.com',
    length: 24,
    merchant: {
      logo: 'three.svg',
      name: 'Three'
    }
  }
];

var dealsCollection = db.addCollection('deals');

data.forEach(function(deal) {
  dealsCollection.insert(deal);
});

data.length = 0;

var comparisonChart = new Vue({
  el: '.comparison-chart',
  data: {
    query: {
      data: -1,
      minutes: -1,
      texts: -1,
      priceMin: null,
      priceMax: null,
      sort: {
        property: 'price',
        direction: true
      }
    },
    deals: [],
    isLoading: true
  },
  methods: {
    handleFilterChange: function(event) {
      event.preventDefault();
      comparisonChart.query[event.target.name] = event.target.value;
      comparisonChart.fetchData();
    },
    clearFilterData: function(event) {
      comparisonChart.query.data = -1;
    },
    clearFilterMinutes: function(event) {
      comparisonChart.query.minutes = -1;
    },
    clearFilterTexts: function(event) {
      comparisonChart.query.texts = -1;
    },
    clearFilterPrice: function(event) {
      comparisonChart.query.priceMin = null;
      comparisonChart.query.priceMax = null;
    },
    fetchData: function() {

      // set the loading state to true
      comparisonChart.isLoading = true;

      setTimeout(function() {

        // make a request to the db, using the query object to filter
        var result = dealsCollection.chain().find({
          data: { '$gte': comparisonChart.query.data },
          minutes: { '$gte': comparisonChart.query.minutes },
          texts: { '$gte': comparisonChart.query.texts },
          priceMin: { '$gte': comparisonChart.query.priceMin },
          priceMax: { '$lte': comparisonChart.query.priceMax }
        })
        .simplesort(comparisonChart.query.sort.property, comparisonChart.query.sort.direction)
        .data();

        comparisonChart.deals = result;

        comparisonChart.isLoading = false;

      }, 500);

    },
    handleDataSort: function(event) {

      var value = event.target.value.split('_');
      var property = value[0];
      var direction = value[1];

      comparisonChart.query.sort = {
        property: property,
        direction: direction === 'desc' ? true : false
      };

      comparisonChart.fetchData();
    },
    toggleFilters: function(event) {

      event.preventDefault();

      var filters = document.querySelector('.comparison-chart-filters');

      filters.classList.toggle('show');
    }
  }
});

comparisonChart.fetchData();
