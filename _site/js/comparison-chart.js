var gigify = function(value) {
  return value < 1000 ? '' + value + 'MB' : '' + (value / 1000) + 'GB';
};

var pluralise = function(value, plur, sing) {
  return value > 1 || value === 0 ? plur : sing;
};

var db = new loki('db.json');

var dealsCollection = db.addCollection('deals');

dealData.forEach(function(deal) {
  dealsCollection.insert(deal);
});

dealData.length = 0;

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
      comparisonChart.query[event.target.name] = Number(event.target.value);
      comparisonChart.fetchData();
    },
    clearFilterData: function(event) {
      comparisonChart.query.data = -1;
      comparisonChart.fetchData();
    },
    clearFilterMinutes: function(event) {
      comparisonChart.query.minutes = -1;
      comparisonChart.fetchData();
    },
    clearFilterTexts: function(event) {
      comparisonChart.query.texts = -1;
      comparisonChart.fetchData();
    },
    clearFilterPrice: function(event) {
      comparisonChart.query.priceMin = null;
      comparisonChart.query.priceMax = null;
      comparisonChart.fetchData();
    },
    fetchData: function() {

      // set the loading state to true
      comparisonChart.isLoading = true;

      setTimeout(function() {

        var query = {
          data: { '$gte': comparisonChart.query.data },
          minutes: { '$gte': comparisonChart.query.minutes },
          texts: { '$gte': comparisonChart.query.texts }
        };

        if (comparisonChart.query.priceMin !== null && comparisonChart.query.priceMax !== null) {
          query.price = { '$between': [comparisonChart.query.priceMin, comparisonChart.query.priceMax] };
        } else if (comparisonChart.query.priceMin !== null && comparisonChart.query.priceMax === null) {
          query.price = { '$gte': comparisonChart.query.priceMin };
        } else if (comparisonChart.query.priceMin === null && comparisonChart.query.priceMax !== null) {
          query.price = { '$lte': comparisonChart.query.priceMax };
        }

        // make a request to the db, using the query object to filter
        var result = dealsCollection.chain().find(query)
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
