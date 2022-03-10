//STACKED AREA CHART
//code for stacked chart adapted from: https://www.d3-graph-gallery.com/graph/stackedarea_template.html
//code for country dropdown menu adapted from: https://bl.ocks.org/ProQuestionAsker/8382f70af7f4a7355827c6dc4ee8817d

// set the dimensions and margins of the graph
var margin = { top: 60, right: 230, bottom: 50, left: 50 },
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#stackedAll")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// format the data (not needed here)
//var formatYear = d3.timeFormat("%Y");
//var parseYear = d3.timeParse("%Y");

// Parse the Data
d3.csv("Data/commodities_wide_20.csv", function (data) {

    console.log(data)

    // nest the data per country
    var nest = d3.nest()
        .key(function (d) {
            return d.country;
        })
        .entries(data)

    console.log(nest)

    // Create the dropdown menu (button)
    var countryMenu = d3.select("#countryDropdown")

    countryMenu
        .append("select")
        .selectAll("option")
        .data(nest)
        .enter()
        .append("option")
        .attr("value", function (d) {
            return d.key;
        })
        .text(function (d) {
            return d.key;
        })

    console.log(nest[0].key)
    console.log(nest[0])

    //GENERAL

    // List of commodities = header of the csv files (minus the country and year columns)
    var keys = data.columns.slice(2)
    console.log(keys)

    /*
         //title
         svg.append("text")
         .attr("x", (width / 2))             
         .attr("y", margin.top / 2)
         .attr("text-anchor", "middle")  
         .style("font-size", "16px") 
         //.style("text-decoration", "underline")
         .style("fill", "white")  
         .text("UK food imports: top 20 countries");
*/



    // Add X axis
    var x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d.year; }))
        .range([0, width]);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(4))


    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .text("Time (year)")
        .style("fill", "#D7D9DB");

    // Add Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", -136)
        .attr("y", -40)
        .text("Commodities (£'s million)")
        .attr("text-anchor", "start")
        .attr("transform", "rotate(-90)")
        .style("fill", "#D7D9DB");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([0, 5000])
        .range([height, 0]);
    var yAxis = svg.append("g")
        .call(d3.axisLeft(y).ticks(5))



    //color of axis

    var axCol = "#D7D9DB"

    xAxis.selectAll("line")
        .style("stroke", axCol);

    xAxis.selectAll("path")
        .style("stroke", axCol);

    xAxis.selectAll("text")
        .style("fill", axCol);


    yAxis.selectAll("line")
        .style("stroke", axCol);

    yAxis.selectAll("path")
        .style("stroke", axCol);

    yAxis.selectAll("text")
        .style("fill", axCol);


  

    //Function to create the initial graph

    var initialGraph = function (country) {

        //filter the data by country
        var selectCountry = nest.filter(function (d) {

            return d.key == country;

        })
        console.log(selectCountry)
        console.log(selectCountry[0].values)



        var selectCountryGroups = svg.selectAll(".countryGroups")
            .data(selectCountry)
            .enter()
            .append("g")
            .attr("class", "countryGroups")

        //console.log(selectCountryGroups)


        // color palette
        var color = d3.scaleOrdinal()
            .domain(keys)
            .range(d3.schemeTableau10);
            //.range(d3.schemeSet3)


        //stack the data
        var stackedData = d3.stack()
            .keys(keys)
            (selectCountry[0].values)

        console.log(stackedData)


        // Area generator
        var area = d3.area()
            .x(function (d) { return x(d.data.year); })
            .y0(function (d) { return y(d[0]); })
            .y1(function (d) { return y(d[1]); })

        // Show the areas
        var initialAreaChart = selectCountryGroups.selectAll('.stacks')
            .data(stackedData)
            .enter()
            .append("path")
            .attr("class", function (d) { return "myArea" + d.key })
            .style("fill", function (d) { return color(d.key); })
            .style("opacity", .7)

        initialAreaChart
            .attr("d", area)
            .attr('class', 'stacks')


       

        // LEGEND 

        // Add one rect in the legend for each name.
        var legendRectSize = 18;
        var legendSpacing = 4;

        var legend = svg.selectAll('.legend')
            .data(keys)
            .enter()
            .append('svg')
            .attr('class', 'legend')
            .attr('transform', function (d, i) {
                var heightL = legendRectSize + legendSpacing;
                var offset = heightL * keys.length / 2;
                var horz = width + margin.left + 8;
                var vert = height - 107 + i * heightL - offset;
                return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .data(keys)
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', function (d) { return color(d) })
            .style('stroke', function (d) { return color(d) })
            .style("opacity", .7)
        //.on("mouseover", highlight)
        //.on("mouseleave", noHighlight);

        legend.append('text')
            .data(keys)
            .attr('x', 4+ legendRectSize + legendSpacing)
            .attr('y', legendRectSize - legendSpacing)
            .text(function (d) { return d; })
            .style('fill', function (d) { return color(d) })
            .style("opacity", .7)
        //.on("mouseover", highlight)
        //.on("mouseleave", noHighlight);
    }

    //create the initial graph for Ireland
    initialGraph('Ireland')


    // Update the data by country
    var updateGraph = function (country) {

        // Filter the data to include only country of interest
        var selectCountry = nest.filter(function (d) {
            return d.key == country;
        })

        // Select all of the grouped elements and update the data
        var selectCountryGroups = svg.selectAll(".countryGroups")
            .data(selectCountry)

        //stack the data
        var stackedData = d3.stack()
            .keys(keys)
            (selectCountry[0].values)


        // Area generator
        var area = d3.area()
            .x(function (d) { return x(d.data.year); })
            .y0(function (d) { return y(d[0]); })
            .y1(function (d) { return y(d[1]); })

        // Show the areas
        selectCountryGroups.selectAll('path.stacks')
            .data(stackedData)
            .transition()
            .duration(1000)
            .attr("d", area)


    }
    // Run update function when dropdown selection changes
    countryMenu.on('change', function () {

        // Find which country was selected from the dropdown
        var selectedCountry = d3.select(this)
            .select("select")
            .property("value")

        // Run update function with the selected country
        updateGraph(selectedCountry)

    });

})
